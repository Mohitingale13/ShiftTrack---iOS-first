import * as SecureStore from 'expo-secure-store';
import { CreateShiftInput, ShiftRecord } from '../types';
import { getStartOfWeek } from '../utils/date';

const SHIFTS_STORAGE_KEY = 'shifttrack_mock_shifts_data';

/**
 * Creates seed shifts for the current week for hospitality staff.
 */
function createSeedShifts(userId: string, hourlyRate: number = 18.50): ShiftRecord[] {
  const monday = getStartOfWeek(new Date());

  // Helper to make a date on day offset (0 = Monday, 1 = Tuesday, ...)
  const makeDate = (dayOffset: number, hours: number, minutes: number = 0) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOffset);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'shift_seed_mon',
      userId,
      role: 'server',
      location: 'Main Dining Room',
      scheduledStart: makeDate(0, 10, 0),
      scheduledEnd: makeDate(0, 16, 0),
      actualClockIn: makeDate(0, 9, 58),
      actualClockOut: makeDate(0, 16, 5),
      breaks: [
        {
          id: 'brk_1',
          startTime: makeDate(0, 13, 0),
          endTime: makeDate(0, 13, 30),
          durationMinutes: 30,
          isPaid: true,
        },
      ],
      hourlyRate,
      status: 'completed',
      notes: 'Lunch service rush covered.',
    },
    {
      id: 'shift_seed_wed',
      userId,
      role: 'server',
      location: 'Patio & Lounge',
      scheduledStart: makeDate(2, 16, 0),
      scheduledEnd: makeDate(2, 23, 0),
      actualClockIn: makeDate(2, 15, 55),
      actualClockOut: makeDate(2, 23, 10),
      breaks: [
        {
          id: 'brk_2',
          startTime: makeDate(2, 19, 0),
          endTime: makeDate(2, 19, 45),
          durationMinutes: 45,
          isPaid: true,
        },
      ],
      hourlyRate,
      status: 'completed',
      notes: 'Dinner rotation and closing duties.',
    },
    {
      id: 'shift_seed_fri',
      userId,
      role: 'server',
      location: 'Main Dining Room',
      scheduledStart: makeDate(4, 17, 0),
      scheduledEnd: makeDate(4, 23, 30),
      breaks: [
        {
          id: 'brk_3',
          startTime: makeDate(4, 20, 0),
          durationMinutes: 30,
          isPaid: true,
        },
      ],
      hourlyRate,
      status: 'scheduled',
      notes: 'Friday evening dinner shift.',
    },
    {
      id: 'shift_seed_sat',
      userId,
      role: 'server',
      location: 'Banquets & Private Dining',
      scheduledStart: makeDate(5, 12, 0),
      scheduledEnd: makeDate(5, 20, 0),
      breaks: [
        {
          id: 'brk_4',
          startTime: makeDate(5, 15, 30),
          durationMinutes: 45,
          isPaid: true,
        },
      ],
      hourlyRate,
      status: 'scheduled',
      notes: 'Weekend catering event.',
    },
  ];
}

async function loadPersistedShifts(): Promise<ShiftRecord[] | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      const json = await SecureStore.getItemAsync(SHIFTS_STORAGE_KEY);
      if (json) {
        return JSON.parse(json);
      }
    }
  } catch (err) {
    console.warn('Failed to load persisted shifts:', err);
  }
  return null;
}

async function savePersistedShifts(shifts: ShiftRecord[]): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.setItemAsync(SHIFTS_STORAGE_KEY, JSON.stringify(shifts));
    }
  } catch (err) {
    console.warn('Failed to persist shifts:', err);
  }
}

/**
 * In-memory fallback / cache for fast query operations
 */
let inMemoryShiftsCache: ShiftRecord[] | null = null;

/**
 * Fetches all shifts for a user, restoring persisted records or generating baseline seeds.
 */
export async function fetchShiftsApi(userId: string, hourlyRate: number = 18.50): Promise<ShiftRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (!inMemoryShiftsCache) {
    const persisted = await loadPersistedShifts();
    if (persisted && persisted.length > 0) {
      inMemoryShiftsCache = persisted;
    } else {
      inMemoryShiftsCache = createSeedShifts(userId, hourlyRate);
      await savePersistedShifts(inMemoryShiftsCache);
    }
  }

  // Filter for user and sort by scheduled start ascending
  return [...inMemoryShiftsCache]
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
}

/**
 * Creates a new shift after validating start, end, and break times.
 */
export async function createShiftApi(
  userId: string,
  input: CreateShiftInput,
  hourlyRate: number = 18.50
): Promise<ShiftRecord> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const startTime = new Date(input.scheduledStart).getTime();
  const endTime = new Date(input.scheduledEnd).getTime();

  if (isNaN(startTime) || isNaN(endTime)) {
    throw new Error('Invalid start or end date format.');
  }

  if (endTime <= startTime) {
    throw new Error('Shift end time must be after the start time.');
  }

  const durationMinutes = (endTime - startTime) / (1000 * 60);
  if (input.breakDurationMinutes < 0) {
    throw new Error('Break duration cannot be negative.');
  }

  if (input.breakDurationMinutes >= durationMinutes) {
    throw new Error('Break duration must be less than the total shift duration.');
  }

  const newShift: ShiftRecord = {
    id: `shift_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    role: input.role ?? 'server',
    location: input.location?.trim() || 'Main Location',
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
    breaks: input.breakDurationMinutes > 0 ? [
      {
        id: `brk_${Date.now()}`,
        startTime: new Date(startTime + (endTime - startTime) / 2).toISOString(),
        durationMinutes: input.breakDurationMinutes,
        isPaid: true,
      },
    ] : [],
    hourlyRate,
    status: 'scheduled',
    notes: input.notes?.trim() || undefined,
  };

  if (!inMemoryShiftsCache) {
    inMemoryShiftsCache = (await loadPersistedShifts()) || createSeedShifts(userId, hourlyRate);
  }

  inMemoryShiftsCache.push(newShift);
  await savePersistedShifts(inMemoryShiftsCache);

  return newShift;
}

/**
 * Starts a shift: marks actualClockIn with current timestamp and transitions status to 'active'.
 */
export async function startShiftApi(
  userId: string,
  shiftId?: string,
  hourlyRate: number = 18.50
): Promise<ShiftRecord> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!inMemoryShiftsCache) {
    inMemoryShiftsCache = (await loadPersistedShifts()) || createSeedShifts(userId, hourlyRate);
  }

  // Ensure no other shift is currently active
  const alreadyActive = inMemoryShiftsCache.find((s) => s.userId === userId && s.status === 'active');
  if (alreadyActive && alreadyActive.id !== shiftId) {
    throw new Error('Another shift is currently active. End the active shift before starting a new one.');
  }

  const nowIso = new Date().toISOString();

  if (shiftId) {
    const shift = inMemoryShiftsCache.find((s) => s.id === shiftId);
    if (!shift) {
      throw new Error('Shift not found.');
    }
    if (shift.status === 'active') {
      return shift; // Already active
    }
    if (shift.status === 'completed') {
      throw new Error('Cannot start a shift that has already been completed.');
    }

    shift.actualClockIn = nowIso;
    shift.status = 'active';
    await savePersistedShifts(inMemoryShiftsCache);
    return shift;
  }

  // Create an ad-hoc active shift starting now
  const now = new Date();
  const scheduledEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000); // Default 6 hour shift

  const adHocShift: ShiftRecord = {
    id: `shift_active_${Date.now()}`,
    userId,
    role: 'server',
    location: 'Floor Service',
    scheduledStart: nowIso,
    scheduledEnd: scheduledEnd.toISOString(),
    actualClockIn: nowIso,
    breaks: [],
    hourlyRate,
    status: 'active',
  };

  inMemoryShiftsCache.push(adHocShift);
  await savePersistedShifts(inMemoryShiftsCache);
  return adHocShift;
}

/**
 * Ends an active shift: sets actualClockOut and transitions status to 'completed'.
 */
export async function endShiftApi(shiftId: string): Promise<ShiftRecord> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!inMemoryShiftsCache) {
    inMemoryShiftsCache = await loadPersistedShifts();
  }

  if (!inMemoryShiftsCache) {
    throw new Error('No shifts found.');
  }

  const shift = inMemoryShiftsCache.find((s) => s.id === shiftId);
  if (!shift) {
    throw new Error('Shift not found.');
  }

  if (shift.status !== 'active') {
    throw new Error('Cannot end a shift that is not active.');
  }

  shift.actualClockOut = new Date().toISOString();
  shift.status = 'completed';

  await savePersistedShifts(inMemoryShiftsCache);
  return shift;
}