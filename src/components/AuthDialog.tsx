import React, { useState } from 'react';
import { supabase } from '../supabase';

interface AuthDialogProps {
  onClose: () => void;
}

export function AuthDialog({ onClose }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrorMessage('');
    setMessage('');
    try {
      const credentials = { email: email.trim(), password };
      const { data, error } = mode === 'register'
        ? await supabase.auth.signUp({
            ...credentials,
            options: {
              // Always send confirmation emails back to the live app, even when
              // registration was started from a local development server.
              emailRedirectTo:
                import.meta.env.VITE_AUTH_REDIRECT_URL ||
                'https://chronoflow-web.onrender.com',
            },
          })
        : await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      if (data.session) {
        onClose();
      } else if (mode === 'register') {
        setMessage('Konto angelegt. Bitte bestätige deine E-Mail über den zugesendeten Link und melde dich danach an.');
      } else {
        setErrorMessage('Anmeldung nicht abgeschlossen. Bitte bestätige gegebenenfalls deine E-Mail.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Benutzerkonto" className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{mode === 'register' ? 'Konto erstellen' : 'Anmelden'}</h2>
          <button type="button" onClick={onClose} aria-label="Schließen" className="px-2 text-xl text-slate-400 hover:text-white">×</button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="text-sm" htmlFor="auth-email">E-Mail</label>
          <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" />
          <label className="text-sm" htmlFor="auth-password">Passwort</label>
          <input id="auth-password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" />
          {errorMessage && <p role="alert" className="text-sm text-red-400">{errorMessage}</p>}
          {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
          <button type="submit" disabled={busy} className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-50">{busy ? 'Bitte warten …' : mode === 'register' ? 'Registrieren' : 'Anmelden'}</button>
        </form>
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMessage(''); setMessage(''); }} className="mt-4 text-sm text-emerald-400 hover:text-emerald-300">{mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Bereits ein Konto? Anmelden'}</button>
      </div>
    </div>
  );
}
