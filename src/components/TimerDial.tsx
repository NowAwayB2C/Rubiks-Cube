import React from 'react';
import type { TimerPhase } from '../types';
import { formatMinutesSecondsMillis } from '../utils/formatTime';

interface TimerDialProps {
  phase: TimerPhase;
  countdownRemainingMs: number;
  stopwatchElapsedMs: number;
  totalElapsedMs: number;
  isTransitionPulse: boolean;
  wasStoppedEarly?: boolean;
}

export const TimerDial: React.FC<TimerDialProps> = ({
  phase,
  countdownRemainingMs,
  stopwatchElapsedMs,
  totalElapsedMs,
  isTransitionPulse,
  wasStoppedEarly = false,
}) => {
  const TOTAL_COUNTDOWN_MS = 120000; // 2 minutes

  // Calculate percentage of countdown
  let progressRatio = 1;
  if (phase === 'countdown') {
    progressRatio = Math.max(0, countdownRemainingMs / TOTAL_COUNTDOWN_MS);
  } else if (phase === 'stopwatch') {
    progressRatio = 0; // Countdown is 100% complete
  } else if (phase === 'idle') {
    progressRatio = 1;
  } else if (phase === 'stopped') {
    progressRatio = countdownRemainingMs === 0 ? 0 : countdownRemainingMs / TOTAL_COUNTDOWN_MS;
  }

  // Circular progress SVG constants
  const size = 320;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Dynamic theme colors based on phase
  let dialColorClass = 'text-emerald-400';
  let strokeColorClass = '#10B981';
  let statusText = 'Bereit für 2-Minuten-Countdown';
  let statusBadgeClass = 'text-slate-400 bg-slate-900/60 border-slate-800';

  if (phase === 'countdown') {
    dialColorClass = 'text-amber-400';
    strokeColorClass = '#F59E0B';
    statusText = 'Countdown läuft (2 Minuten Ziel)';
    statusBadgeClass = 'text-amber-300 bg-amber-950/40 border-amber-800/50';
  } else if (phase === 'stopwatch') {
    dialColorClass = 'text-cyan-400';
    strokeColorClass = '#06B6D4';
    statusText = 'Stoppuhr aktiv (Nachspielzeit)';
    statusBadgeClass = 'text-cyan-300 bg-cyan-950/40 border-cyan-800/50';
  } else if (phase === 'stopped') {
    if (wasStoppedEarly) {
      dialColorClass = 'text-amber-400';
      strokeColorClass = '#F59E0B';
      statusText = 'Vorzeitig abgebrochen (Nicht in Statistik)';
      statusBadgeClass = 'text-amber-300 bg-amber-950/40 border-amber-800/50';
    } else {
      dialColorClass = 'text-slate-100';
      strokeColorClass = '#10B981';
      statusText = 'Durchgang beendet & gespeichert';
      statusBadgeClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center my-6 select-none">
      {/* Visual pulse glow on stopwatch switch */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-700 pointer-events-none ${
          isTransitionPulse
            ? 'opacity-80 scale-110 bg-cyan-500/20 blur-2xl animate-pulse'
            : phase === 'stopwatch'
            ? 'opacity-30 bg-cyan-500/10 blur-xl'
            : phase === 'countdown'
            ? 'opacity-20 bg-amber-500/10 blur-xl'
            : 'opacity-0'
        }`}
      />

      {/* Main Circular Dial */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/60"
            fill="transparent"
          />

          {/* Active Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-100 ease-linear"
            fill="transparent"
          />

          {/* Additional decorative stopwatch ring when in stopwatch phase */}
          {phase === 'stopwatch' && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius - 16}
              stroke="#06B6D4"
              strokeWidth={3}
              strokeDasharray="6 8"
              className="animate-spin origin-center text-cyan-400 opacity-70"
              style={{ animationDuration: '8s' }}
              fill="transparent"
            />
          )}
        </svg>

        {/* Center Digital Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {/* Primary Numeric Display */}
          <div
            className={`font-mono text-5xl sm:text-6xl font-extrabold tracking-tight tabular-nums transition-colors duration-200 ${dialColorClass}`}
          >
            {phase === 'stopwatch' ? (
              <span className="flex items-center">
                <span className="text-3xl sm:text-4xl font-normal text-cyan-500 mr-1">+</span>
                {formatMinutesSecondsMillis(stopwatchElapsedMs)}
              </span>
            ) : phase === 'countdown' ? (
              formatMinutesSecondsMillis(countdownRemainingMs)
            ) : phase === 'stopped' ? (
              formatMinutesSecondsMillis(totalElapsedMs)
            ) : (
              '02:00.00'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
