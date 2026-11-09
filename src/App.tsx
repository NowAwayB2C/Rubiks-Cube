import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { TimerPhase, TimerSession } from './types';
import { downloadJsonFile } from './utils/formatTime';
import { Header } from './components/Header';
import { TimerDial } from './components/TimerDial';
import { PrimaryButton } from './components/PrimaryButton';
import { HistoryList } from './components/HistoryList';
import { AnalyticsChart } from './components/AnalyticsChart';

const LOCAL_STORAGE_KEY = 'chronoflow_saved_sessions_v1';
const COUNTDOWN_TARGET_MS = 120000; // 2 minutes

type SupabaseSessionRow = {
  id: string;
  user_id: string;
  started_at: string;
  stopped_at: string;
  timer_duration_ms: number | string;
  stopwatch_duration_ms: number | string;
  total_duration_ms: number | string;
  completed_countdown: boolean;
  created_at: string;
};

function toSupabaseSessionRow(session: TimerSession, userId: string) {
  return {
    id: session.id,
    user_id: userId,
    started_at: session.startedAt,
    stopped_at: session.stoppedAt,
    timer_duration_ms: session.timerDurationMs,
    stopwatch_duration_ms: session.stopwatchDurationMs,
    total_duration_ms: session.totalDurationMs,
    completed_countdown: session.completedCountdown,
    created_at: session.createdAt || session.stoppedAt || new Date().toISOString(),
  };
}

function fromSupabaseSessionRow(row: SupabaseSessionRow): TimerSession {
  return {
    id: row.id,
    userId: row.user_id,
    startedAt: row.started_at,
    stoppedAt: row.stopped_at,
    timerDurationMs: Number(row.timer_duration_ms),
    stopwatchDurationMs: Number(row.stopwatch_duration_ms),
    totalDurationMs: Number(row.total_duration_ms),
    completedCountdown: row.completed_countdown,
    createdAt: row.created_at,
  };
}

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  // Timer states
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [countdownRemainingMs, setCountdownRemainingMs] = useState(COUNTDOWN_TARGET_MS);
  const [stopwatchElapsedMs, setStopwatchElapsedMs] = useState(0);
  const [totalElapsedMs, setTotalElapsedMs] = useState(0);
  const [isTransitionPulse, setIsTransitionPulse] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [wasStoppedEarly, setWasStoppedEarly] = useState(false);

  // History list
  const [sessions, setSessions] = useState<TimerSession[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Timing references for high-accuracy animation loop
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const stopwatchStartRef = useRef<number>(0);
  const currentPhaseRef = useRef<TimerPhase>('idle');
  const sessionStartDateRef = useRef<Date | null>(null);

  // Keep phase ref in sync for keydown and RAF loop
  currentPhaseRef.current = phase;

  // 1. Supabase authentication state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Keep the latest local history available for migration after sign-in.
  const sessionsRef = useRef<TimerSession[]>(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // 2. Realtime Supabase sync for the authenticated user
  useEffect(() => {
    let active = true;

    if (!user) {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) setSessions(JSON.parse(cached));
      } catch (err) {
        console.error('Failed reading localStorage', err);
      }
      setIsLoadingCloud(false);
      return;
    }

    setIsLoadingCloud(true);

    const refreshCloudSessions = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (error) {
        console.error('Supabase session read failed:', error);
        setIsLoadingCloud(false);
        return;
      }

      setSessions((data ?? []).map((row) => fromSupabaseSessionRow(row as SupabaseSessionRow)));
      setIsLoadingCloud(false);
    };

    const migrateGuestSessionsAndLoad = async () => {
      try {
        const guestSessions = sessionsRef.current.filter(
          (session) => !session.userId || session.userId === 'guest'
        );

        if (guestSessions.length > 0) {
          const { error } = await supabase
            .from('sessions')
            .upsert(
              guestSessions.map((session) => toSupabaseSessionRow(session, user.id)),
              { onConflict: 'user_id,id', ignoreDuplicates: true }
            );

          if (error) throw error;
        }

        await refreshCloudSessions();
      } catch (error) {
        console.error('Supabase session sync failed:', error);
        if (active) setIsLoadingCloud(false);
      }
    };

    const channel = supabase
      .channel(`sessions:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `user_id=eq.${user.id}` },
        () => { void refreshCloudSessions(); }
      )
      .subscribe();

    void migrateGuestSessionsAndLoad();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [user]);

  // 3. Save local sessions to localStorage when not logged in
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
      } catch (err) {
        console.error('Failed saving to localStorage', err);
      }
    }
  }, [sessions, user]);

  // 4. Stop RAF loop helper
  const cancelTimerLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // 5. Timer update tick
  const tick = useCallback(() => {
    const now = performance.now();

    if (currentPhaseRef.current === 'countdown') {
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, COUNTDOWN_TARGET_MS - elapsed);

      setCountdownRemainingMs(remaining);
      setTotalElapsedMs(elapsed);

      // AUTOMATIC TRANSITION TO STOPWATCH AT 2 MINUTES
      if (remaining <= 0) {
        currentPhaseRef.current = 'stopwatch';
        setPhase('stopwatch');
        setCountdownRemainingMs(0);
        stopwatchStartRef.current = now;

        // Visual transition impulse
        setIsTransitionPulse(true);
        setTimeout(() => setIsTransitionPulse(false), 1400);

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    } else if (currentPhaseRef.current === 'stopwatch') {
      const swElapsed = now - stopwatchStartRef.current;
      setStopwatchElapsedMs(swElapsed);
      setTotalElapsedMs(COUNTDOWN_TARGET_MS + swElapsed);

      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  // 6. Start Timer action
  const handleStartTimer = useCallback(() => {
    cancelTimerLoop();
    const nowPerf = performance.now();
    startTimeRef.current = nowPerf;
    sessionStartDateRef.current = new Date();

    setWasStoppedEarly(false);
    setCountdownRemainingMs(COUNTDOWN_TARGET_MS);
    setStopwatchElapsedMs(0);
    setTotalElapsedMs(0);
    currentPhaseRef.current = 'countdown';
    setPhase('countdown');

    rafRef.current = requestAnimationFrame(tick);
  }, [cancelTimerLoop, tick]);

  // 7. Stop Timer action and log session
  const handleStopTimer = useCallback(async () => {
    cancelTimerLoop();
    const currentPhase = currentPhaseRef.current;
    const nowPerf = performance.now();
    const stopDate = new Date();
    const startDate = sessionStartDateRef.current || new Date(stopDate.getTime() - 1000);

    // If stopped during the countdown timer: do NOT record in statistics or Firebase!
    if (currentPhase === 'countdown') {
      const elapsed = Math.min(COUNTDOWN_TARGET_MS, Math.round(nowPerf - startTimeRef.current));
      currentPhaseRef.current = 'stopped';
      setPhase('stopped');
      setWasStoppedEarly(true);
      setTotalElapsedMs(elapsed);
      setStopwatchElapsedMs(0);
      return;
    }

    // Was in stopwatch phase (2-minute countdown was fully completed)
    setWasStoppedEarly(false);
    const finalTimerDurationMs = COUNTDOWN_TARGET_MS;
    const finalStopwatchDurationMs = Math.max(0, Math.round(nowPerf - stopwatchStartRef.current));
    const finalTotalDurationMs = finalTimerDurationMs + finalStopwatchDurationMs;

    // Create session entity
    const cleanId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newSession: TimerSession = {
      id: cleanId,
      userId: user ? user.id : 'guest',
      startedAt: startDate.toISOString(),
      stoppedAt: stopDate.toISOString(),
      timerDurationMs: finalTimerDurationMs,
      stopwatchDurationMs: finalStopwatchDurationMs,
      totalDurationMs: finalTotalDurationMs,
      completedCountdown: true,
      createdAt: stopDate.toISOString(),
    };

    currentPhaseRef.current = 'stopped';
    setPhase('stopped');
    setTotalElapsedMs(finalTotalDurationMs);
    setStopwatchElapsedMs(finalStopwatchDurationMs);

    // Save locally for guests or in Supabase for authenticated users.
    if (user) {
      const { error } = await supabase
        .from('sessions')
        .insert(toSupabaseSessionRow(newSession, user.id));

      if (error) console.error('Supabase session write failed:', error);
    } else {
      setSessions((prev) => [newSession, ...prev]);
    }
  }, [cancelTimerLoop, user]);

  // 8. The SINGLE primary button action router
  const handlePrimaryAction = useCallback(() => {
    if (phase === 'idle') {
      handleStartTimer();
    } else if (phase === 'countdown' || phase === 'stopwatch') {
      handleStopTimer();
    } else if (phase === 'stopped') {
      // In stopped phase, pressing button initiates next round
      handleStartTimer();
    }
  }, [phase, handleStartTimer, handleStopTimer]);

  // 9. Global Spacebar listener: controls the single button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input, textarea, or button focus
      if (
        e.code === 'Space' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault(); // Prevent scrolling page
        setIsSpacePressed(true);
        handlePrimaryAction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePrimaryAction]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => cancelTimerLoop();
  }, [cancelTimerLoop]);

  // 10. Google sign-in via Supabase Auth / Sign-Out
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google Sign-In failed', error);
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogout = async () => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign-Out failed', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 11. Delete session entry
  const handleDeleteSession = async (sessionId: string) => {
    if (user) {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) console.error('Supabase session delete failed:', error);
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  // Only sessions that finished the full 2-minute timer and entered stopwatch are included in statistics
  const statisticsSessions = React.useMemo(() => {
    return sessions.filter((s) => s.completedCountdown === true && s.timerDurationMs >= COUNTDOWN_TARGET_MS);
  }, [sessions]);

  // 12. Export to JSON
  const handleExport = () => {
    if (statisticsSessions.length === 0) return;
    const nowStr = new Date().toISOString().split('T')[0];
    const exportPayload = {
      app: 'ChronoFlow',
      exportedAt: new Date().toISOString(),
      user: user ? { uid: user.id, email: user.email } : 'guest',
      totalSessions: statisticsSessions.length,
      sessions: statisticsSessions,
    };
    downloadJsonFile(exportPayload, `chronoflow_historie_${nowStr}.json`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar with dynamic auth & JSON export */}
      <Header
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        onExport={handleExport}
        historyCount={statisticsSessions.length}
        isAuthenticating={isAuthenticating}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-6 sm:pt-10 max-w-5xl w-full mx-auto">
        {/* Timer Dial Viewport */}
        <TimerDial
          phase={phase}
          countdownRemainingMs={countdownRemainingMs}
          stopwatchElapsedMs={stopwatchElapsedMs}
          totalElapsedMs={totalElapsedMs}
          isTransitionPulse={isTransitionPulse}
          wasStoppedEarly={wasStoppedEarly}
        />

        {/* The ONLY Primary Button for Timer & Stopwatch */}
        <PrimaryButton
          phase={phase}
          onClick={handlePrimaryAction}
          isPressedAnimation={isSpacePressed}
        />

        {/* Analytics Chart with Weekly Averages, Max and Yearly View */}
        <AnalyticsChart sessions={statisticsSessions} />

        {/* History Table with Dates, Countdown, and Stopwatch */}
        <HistoryList
          sessions={statisticsSessions}
          onDeleteSession={handleDeleteSession}
          isCloudSynced={!!user}
          isLoadingCloud={isLoadingCloud}
        />
      </main>
    </div>
  );
}
