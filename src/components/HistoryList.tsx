import React from 'react';
import { Calendar, CheckCircle2, Clock, Trash2, Cloud, Database } from 'lucide-react';
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
    <section className="w-full max-w-4xl mx-auto mt-10 px-4 mb-16">
      {/* Header section with badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Gespeicherte Historie
          </h2>
          <span className="text-xs font-mono text-slate-400 ml-1">
            ({sessions.length} {sessions.length === 1 ? 'Eintrag' : 'Einträge'})
          </span>
        </div>

        {/* Sync indicator status */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {isLoadingCloud ? (
            <span className="flex items-center gap-1.5 text-slate-400 animate-pulse">
              <Cloud className="w-4 h-4 text-slate-400" />
              Lade aus Cloud...
            </span>
          ) : isCloudSynced ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Cloud className="w-4 h-4 text-emerald-400" />
              Mit Firebase synchronisiert
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400" title="Melde dich an, um Daten in Firebase zu sichern">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              Lokal gesichert (Gast)
            </span>
          )}
        </div>
      </div>

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
            Starte den 2-Minuten-Timer mit dem Button oder der Leertaste. Nach Ablauf startet automatisch die Stoppuhr, und beim Stoppen wird das Ergebnis hier protokolliert.
          </p>
        </div>
      ) : (
        /* History Table */
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-medium text-xs">
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Datum &amp; Uhrzeit</span>
                  </div>
                </th>
                <th className="py-3 px-4">2-Min. Countdown</th>
                <th className="py-3 px-4">
                  <span className="text-cyan-400 font-medium">Stoppuhr (Nachzeit)</span>
                </th>
                <th className="py-3 px-4 text-right">Gesamtzeit</th>
                <th className="py-3 px-3 text-center w-12">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Date & Time */}
                  <td className="py-3.5 px-4 text-slate-300 text-xs sm:text-sm whitespace-nowrap">
                    {formatDate(session.stoppedAt || session.startedAt)}
                  </td>

                  {/* 2-Min Countdown column */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {session.completedCountdown ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        02:00.00 (Erreicht)
                      </span>
                    ) : (
                      <span className="text-amber-400/90">
                        {formatMinutesSecondsMillis(session.timerDurationMs)} (Vorzeitig gestoppt)
                      </span>
                    )}
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

                  {/* Total duration */}
                  <td className="py-3.5 px-4 text-right font-bold text-white whitespace-nowrap">
                    {formatMinutesSecondsMillis(session.totalDurationMs)}
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
