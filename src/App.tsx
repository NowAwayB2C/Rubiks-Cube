import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  handleFirestoreError,
  testConnection,
  OperationType,
} from './firebase';
import type { TimerPhase, TimerSession } from './types';
import { downloadJsonFile } from './utils/formatTime';
import { Header } from './components/Header';
import { TimerDial } from './components/TimerDial';
import { PrimaryButton } from './components/PrimaryButton';
import { HistoryList } from './components/HistoryList';

const LOCAL_STORAGE_KEY = 'chronoflow_saved_sessions_v1';
const COUNTDOWN_TARGET_MS = 120000; // 2 minutes

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

  // 1. Initial connection test and auth state listener
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // 2. Realtime Firestore sync when user is authenticated
  useEffect(() => {
    if (!user) {
      // Revert to local storage when signed out
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) setSessions(JSON.parse(cached));
      } catch (err) {
        console.error('Failed reading localStorage', err);
      }
      return;
    }

    setIsLoadingCloud(true);
    const sessionsColPath = `users/${user.uid}/sessions`;
    const sessionsColRef = collection(db, 'users', user.uid, 'sessions');

    const unsubscribe = onSnapshot(
      sessionsColRef,
      (snapshot) => {
        const cloudSessions: TimerSession[] = [];
        snapshot.forEach((docSnap) => {
          cloudSessions.push(docSnap.data() as TimerSession);
        });

        // Sort descending by createdAt or stoppedAt
        cloudSessions.sort((a, b) => {
          const timeA = new Date(a.stoppedAt || a.startedAt).getTime();
          const timeB = new Date(b.stoppedAt || b.startedAt).getTime();
          return timeB - timeA;
        });

        setSessions(cloudSessions);
        setIsLoadingCloud(false);
      },
      (error) => {
        setIsLoadingCloud(false);
        handleFirestoreError(error, OperationType.GET, sessionsColPath);
      }
    );

    return () => unsubscribe();
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

    let finalTimerDurationMs = 0;
    let finalStopwatchDurationMs = 0;
    let completedCountdown = false;

    if (currentPhase === 'countdown') {
      finalTimerDurationMs = Math.min(COUNTDOWN_TARGET_MS, Math.round(nowPerf - startTimeRef.current));
      finalStopwatchDurationMs = 0;
      completedCountdown = false;
    } else {
      // Was in stopwatch phase
      finalTimerDurationMs = COUNTDOWN_TARGET_MS;
      finalStopwatchDurationMs = Math.max(0, Math.round(nowPerf - stopwatchStartRef.current));
      completedCountdown = true;
    }

    const finalTotalDurationMs = finalTimerDurationMs + finalStopwatchDurationMs;

    // Create session entity
    const cleanId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newSession: TimerSession = {
      id: cleanId,
      userId: user ? user.uid : 'guest',
      startedAt: startDate.toISOString(),
      stoppedAt: stopDate.toISOString(),
      timerDurationMs: finalTimerDurationMs,
      stopwatchDurationMs: finalStopwatchDurationMs,
      totalDurationMs: finalTotalDurationMs,
      completedCountdown,
      createdAt: stopDate.toISOString(),
    };

    currentPhaseRef.current = 'stopped';
    setPhase('stopped');
    setTotalElapsedMs(finalTotalDurationMs);
    setStopwatchElapsedMs(finalStopwatchDurationMs);

    // Save locally or to Firestore
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'sessions', newSession.id);
        await setDoc(docRef, newSession);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sessions/${newSession.id}`);
      }
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

  // 10. Google Auth Sign-In / Sign-Out
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Migrate any guest sessions to the newly signed-in user
      if (result.user && sessions.length > 0) {
        const guestSessions = sessions.filter((s) => !s.userId || s.userId === 'guest');
        for (const guestSession of guestSessions) {
          try {
            const updated: TimerSession = { ...guestSession, userId: result.user.uid };
            await setDoc(doc(db, 'users', result.user.uid, 'sessions', updated.id), updated);
          } catch {
            // Ignore duplicate/sync collisions
          }
        }
      }
    } catch (error) {
      console.error('Google Sign-In failed', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogout = async () => {
    setIsAuthenticating(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-Out failed', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 11. Delete session entry
  const handleDeleteSession = async (sessionId: string) => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'sessions', sessionId);
        await deleteDoc(docRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/sessions/${sessionId}`);
      }
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  // 12. Export to JSON
  const handleExport = () => {
    if (sessions.length === 0) return;
    const nowStr = new Date().toISOString().split('T')[0];
    const exportPayload = {
      app: 'ChronoFlow',
      exportedAt: new Date().toISOString(),
      user: user ? { uid: user.uid, email: user.email } : 'guest',
      totalSessions: sessions.length,
      sessions: sessions,
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
        historyCount={sessions.length}
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
        />

        {/* The ONLY Primary Button for Timer & Stopwatch */}
        <PrimaryButton
          phase={phase}
          onClick={handlePrimaryAction}
          isPressedAnimation={isSpacePressed}
        />

        {/* History Table with Dates, Countdown, and Stopwatch */}
        <HistoryList
          sessions={sessions}
          onDeleteSession={handleDeleteSession}
          isCloudSynced={!!user}
          isLoadingCloud={isLoadingCloud}
        />
      </main>

      {/* Footer with clean copyright */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-400">
        ChronoFlow &middot; 2-Minuten Timer &amp; Stoppuhr mit Ein-Knopf-Steuerung
      </footer>
    </div>
  );
}
