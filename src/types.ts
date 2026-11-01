export type TimerPhase = 'idle' | 'countdown' | 'stopwatch' | 'stopped';

export interface TimerSession {
  id: string;
  userId?: string;
  startedAt: string;          // ISO string
  stoppedAt: string;          // ISO string
  timerDurationMs: number;    // Elapsed ms of the 2-minute countdown (max 120000)
  stopwatchDurationMs: number;// Elapsed ms on stopwatch after 2 minutes
  totalDurationMs: number;    // Total elapsed time in ms
  completedCountdown: boolean;// Whether full 2-min countdown was finished
  createdAt?: string;         // ISO string
}
