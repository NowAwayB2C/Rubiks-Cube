import React from 'react';
import { Download, LogIn, LogOut, Timer as TimerIcon, User as UserIcon } from 'lucide-react';
import type { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onExport: () => void;
  historyCount: number;
  isAuthenticating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  onExport,
  historyCount,
  isAuthenticating,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
          <TimerIcon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            ChronoFlow
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            2 Min. Timer &rarr; Stoppuhr
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation / Info */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300">
          [ Leertaste ]
        </span>
        <span>steuert Start &amp; Stopp</span>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Export / Download Button */}
        <button
          onClick={onExport}
          disabled={historyCount === 0}
          title={historyCount === 0 ? 'Noch keine Historie zum Exportieren' : `${historyCount} Einträge als JSON herunterladen`}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportieren (.json)</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
              {historyCount}
            </span>
          )}
        </button>

        {/* Dynamic Auth Button: Transforms from Login to Logout */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              disabled={isAuthenticating}
              title={`Angemeldet als ${user.displayName || user.email || 'Benutzer'} (Klicken zum Abmelden)`}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 shadow-sm"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profil'}
                  className="w-4 h-4 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-red-400" />
              )}
              <span className="hidden sm:inline max-w-[120px] truncate">
                {user.displayName || user.email?.split('@')[0] || 'Konto'}
              </span>
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="font-semibold text-red-200">Abmelden</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            disabled={isAuthenticating}
            title="Mit Google anmelden, um Historie in Firebase zu sichern"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 shadow-md shadow-emerald-950/40"
          >
            <LogIn className="w-4 h-4" />
            <span>{isAuthenticating ? 'Wird angemeldet...' : 'Mit Google anmelden'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
