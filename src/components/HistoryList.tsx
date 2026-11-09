import React from 'react';
import { Trash2 } from 'lucide-react';
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
    </section>
  );
};
