import { ElapsedTime } from '../types';

/**
 * Calculates elapsed time strictly based on persisted wall-clock timestamps.
 * Does not depend on tick counters, preserving accuracy across backgrounding and restarts.
 */
export function calculateElapsedTime(clockInIso: string, referenceTimestamp: number = Date.now()): ElapsedTime {
  const clockInTime = new Date(clockInIso).getTime();

  if (isNaN(clockInTime)) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      formatted: '00:00:00',
    };
  }

  const diffMs = Math.max(0, referenceTimestamp - clockInTime);
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    formatted,
  };
}