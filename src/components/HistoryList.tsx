import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
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
  return (
    <section className="w-full max-w-4xl mx-auto mt-6 px-4 mb-16">

      {/* Empty State */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20 mt-4">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            Noch keine Timer-Durchgänge aufgezeichnet
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Starte den 2-Minuten-Timer mit dem Button oder der Leertaste. Sobald die 2 Minuten ablaufen und die Stoppuhr startet, wird der Durchgang beim Stoppen hier erfasst (vorzeitig abgebrochene Timer werden nicht gespeichert).
          </p>
        </div>
      ) : (
        /* History Table */
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

                  {/* Delete button */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      title="Diesen Eintrag löschen"
                      className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
