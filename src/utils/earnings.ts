import { ShiftRecord } from '../types';
import { calculateNetDurationMinutes } from './date';

export function calculateEarnings(shift: ShiftRecord): number | null {
  if (shift.status !== 'completed') return null;
  if (!shift.actualClockIn || !shift.actualClockOut) return null;
  if (typeof shift.hourlyRate !== 'number' || shift.hourlyRate < 0) return null;
  
  const breakMinutes = shift.breaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);
  const netMinutes = calculateNetDurationMinutes(shift.actualClockIn, shift.actualClockOut, breakMinutes);
  
  const earnings = (Math.max(0, netMinutes) / 60) * shift.hourlyRate;
  return earnings;
}

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return 'Earnings unavailable';
  return '₹' + amount.toFixed(2);
}
