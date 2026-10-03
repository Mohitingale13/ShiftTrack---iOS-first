import { ShiftConflict, ShiftRecord } from '../types';
import { formatDate, formatDuration, formatTime } from '../utils/date';

/**
 * Shift Integrity Assistant
 * Deterministic rule-based conflict detector for shift schedules and active timers.
 */
export function detectShiftConflicts(shifts: ShiftRecord[]): ShiftConflict[] {
  const conflicts: ShiftConflict[] = [];
  const activeAndScheduled = shifts.filter((s) => s.status !== 'cancelled');

  // Rule 1: Detect interval overlaps between shift pairs
  for (let i = 0; i < activeAndScheduled.length; i++) {
    for (let j = i + 1; j < activeAndScheduled.length; j++) {
      const shiftA = activeAndScheduled[i];
      const shiftB = activeAndScheduled[j];

      const startA = new Date(shiftA.actualClockIn || shiftA.scheduledStart).getTime();
      const endA = new Date(shiftA.actualClockOut || shiftA.scheduledEnd).getTime();

      const startB = new Date(shiftB.actualClockIn || shiftB.scheduledStart).getTime();
      const endB = new Date(shiftB.actualClockOut || shiftB.scheduledEnd).getTime();

      if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) {
        continue;
      }

      // Check overlap: A starts before B ends and B starts before A ends
      if (startA < endB && startB < endA) {
        const overlapStart = Math.max(startA, startB);
        const overlapEnd = Math.min(endA, endB);
        const overlapMinutes = Math.round((overlapEnd - overlapStart) / (1000 * 60));

        if (overlapMinutes > 0) {
          const summaryA = `${formatDate(shiftA.scheduledStart)} (${formatTime(shiftA.scheduledStart)} - ${formatTime(shiftA.scheduledEnd)})`;
          const summaryB = `${formatDate(shiftB.scheduledStart)} (${formatTime(shiftB.scheduledStart)} - ${formatTime(shiftB.scheduledEnd)})`;

          conflicts.push({
            id: `overlap_${shiftA.id}_${shiftB.id}`,
            type: 'overlap',
            severity: 'warning',
            shiftId1: shiftA.id,
            shiftId2: shiftB.id,
            shift1Summary: summaryA,
            shift2Summary: summaryB,
            message: `Schedule conflict: Shifts overlap by ${formatDuration(overlapMinutes)} (${summaryA} and ${summaryB}).`,
          });
        }
      }
    }
  }

  // Rule 2: Caution for unusually long open/active shifts (>12 hours)
  const now = Date.now();
  for (const shift of activeAndScheduled) {
    if (shift.status === 'active' && shift.actualClockIn) {
      const clockIn = new Date(shift.actualClockIn).getTime();
      if (!isNaN(clockIn)) {
        const durationHours = (now - clockIn) / (1000 * 3600);
        if (durationHours > 12) {
          conflicts.push({
            id: `long_${shift.id}`,
            type: 'unusually_long',
            severity: 'caution',
            shiftId1: shift.id,
            shift1Summary: `Active shift started ${formatTime(shift.actualClockIn)}`,
            message: `Caution: Active shift has been running for over ${Math.floor(durationHours)} hours. Please check if clock-out was missed.`,
          });
        }
      }
    }
  }

  return conflicts;
}