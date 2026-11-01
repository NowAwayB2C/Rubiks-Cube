import React from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import type { TimerPhase } from '../types';

interface PrimaryButtonProps {
  phase: TimerPhase;
  onClick: () => void;
  isPressedAnimation?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  phase,
  onClick,
  isPressedAnimation = false,
}) => {
  const isRunning = phase === 'countdown' || phase === 'stopwatch';

  let buttonText = 'Timer starten';
  let buttonColor = 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 border-emerald-500/40 ring-emerald-500/30';
  let Icon = Play;

  if (isRunning) {
    buttonText = 'Stoppen';
    buttonColor = 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 border-rose-500/40 ring-rose-500/30 animate-none';
    Icon = Square;
  } else if (phase === 'stopped') {
    buttonText = 'Neuer Durchgang';
    buttonColor = 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 border-emerald-500/40 ring-emerald-500/30';
    Icon = RotateCcw;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-2">
      <button
        onClick={onClick}
        type="button"
        aria-label={`${buttonText} (auch mit Leertaste)`}
        className={`group relative flex items-center justify-center gap-3 px-10 py-5 text-xl sm:text-2xl font-bold rounded-2xl border transition-all duration-150 transform cursor-pointer select-none shadow-xl active:scale-95 focus:outline-none focus:ring-4 ${buttonColor} ${
          isPressedAnimation ? 'scale-95 ring-4 ring-white/50' : ''
        }`}
      >
        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110 ${isRunning ? 'fill-current' : ''}`} />
        <span className="tracking-wide uppercase">{buttonText}</span>
      </button>

      {/* Keyboard hotkey hint badge */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
        <kbd className="px-2 py-0.5 font-mono text-[11px] bg-slate-900 border border-slate-700/60 rounded text-slate-300 shadow-inner">
          Leertaste
        </kbd>
        <span>zum {isRunning ? 'Stoppen' : 'Starten'} drücken</span>
      </div>
    </div>
  );
};
