import React, { useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import type { TimerSession } from '../types';
import { formatDate, formatMinutesSecondsMillis } from '../utils/formatTime';

interface HistoryListProps {
  sessions: TimerSession[];
  onDeleteSession: (id: string) => void;
  isCloudSynced: boolean;
  isLoadingCloud: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  sessions,
  onDeleteSession,
  isCloudSynced,
  isLoadingCloud,
}) => {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  if (sessions.length === 0) return null;

  return (
    <section className="w-full max-w-4xl mx-auto mt-6 px-4 mb-16">

      <div className="mt-4 overflow-x-auto rounded-xl bg-slate-900/30 backdrop-blur-sm p-1">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <tbody className="font-mono text-slate-200">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Date & Time */}
                  <td className="py-3.5 px-4 text-slate-300 text-xs sm:text-sm whitespace-nowrap">
                    {formatDate(session.stoppedAt || session.startedAt)}
                  </td>

                  {/* Stopwatch Overtime */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {session.stopwatchDurationMs > 0 ? (
                      <span className="text-cyan-300 font-bold">
                        +{formatMinutesSecondsMillis(session.stopwatchDurationMs)}
                      </span>
                    ) : (
                      <span className="text-slate-400">00:00.00</span>
                    )}
                  </td>

                  {/* Delete confirmation: only the red X and green check are visible. */}
                  <td className="relative py-3.5 px-3 text-center">
                    {confirmingDeleteId === session.id ? (
                      <div className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 p-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          aria-label="Löschen abbrechen"
                          title="Abbrechen"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-rose-400 transition-colors hover:bg-rose-950/60 hover:text-rose-300"
                        >
                          <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteSession(session.id);
                            setConfirmingDeleteId(null);
                          }}
                          aria-label="Löschen bestätigen"
                          title="Löschen bestätigen"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-400 transition-colors hover:bg-emerald-950/60 hover:text-emerald-300"
                        >
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(session.id)}
                        aria-label="Löschen"
                        title="Diesen Eintrag löschen"
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </section>
  );
};
