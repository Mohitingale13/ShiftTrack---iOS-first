/**
 * Date and Time Formatting Utilities for ShiftTrack
 */

export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return '--:--';
  }
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return 'Invalid date';
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

export function calculateNetDurationMinutes(
  startIso: string,
  endIso: string,
  breakMinutes: number = 0
): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  if (isNaN(start) || isNaN(end) || end <= start) {
    return 0;
  }

  const grossMinutes = (end - start) / (1000 * 60);
  const netMinutes = Math.max(0, grossMinutes - breakMinutes);
  return Math.round(netMinutes);
}

/**
 * Returns the Monday 00:00:00.000 of the week containing the given date.
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // In JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Convert so Monday is 0, Sunday is 6
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the Sunday 23:59:59.999 of the week containing the given date.
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function isDateInCurrentWeek(dateIso: string, referenceDate: Date = new Date()): boolean {
  try {
    const timestamp = new Date(dateIso).getTime();
    if (isNaN(timestamp)) return false;
    const start = getStartOfWeek(referenceDate).getTime();
    const end = getEndOfWeek(referenceDate).getTime();
    return timestamp >= start && timestamp <= end;
  } catch {
    return false;
  }
}