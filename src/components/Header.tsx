import React from 'react';
import { Download, LogIn, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

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
    <header className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Export / Download Button */}
        <button
          onClick={onExport}
          disabled={historyCount === 0}
          title={historyCount === 0 ? 'Noch keine Historie zum Exportieren' : `${historyCount} Einträge als JSON herunterladen`}
          aria-label="Exportieren (.json)"
          className="p-2.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Dynamic Auth Button: Transforms from Login to Logout */}
        {user ? (
          <button
            onClick={onLogout}
            disabled={isAuthenticating}
            title={`Angemeldet als ${user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Benutzer'} (Klicken zum Abmelden)`}
            aria-label="Abmelden"
            className="p-2.5 text-xs font-medium text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        ) : (
          <button
            onClick={onLogin}
            disabled={isAuthenticating}
            title="Anmelden"
            aria-label="Anmelden"
            className="p-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-md shadow-emerald-950/40"
          >
            <LogIn className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
