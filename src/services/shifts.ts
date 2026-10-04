import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { CreateShiftInput, ShiftRecord } from '../types';
import { getStartOfWeek } from '../utils/date';

const SHIFTS_STORAGE_KEY = 'shifttrack_mock_shifts_data';

function isWebBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Test & Development mechanism to simulate network error for demonstration of error states and retry actions.
 */
let simulateApiError = false;

export function setSimulateShiftApiError(shouldError: boolean): void {
  simulateApiError = shouldError;
}

export function isSimulateShiftApiError(): boolean {
  return simulateApiError;
}

/**
 * Normalizes a shift to ensure both internal and canonical PDF API fields are present.
 * Canonical PDF fields:
 * - date: 'YYYY-MM-DD'
 * - startTime: ISO 8601
 * - endTime: ISO 8601 or null (when active)
 * - breakMinutes: total break duration in minutes
 */
function normalizeShiftRecord(shift: ShiftRecord): ShiftRecord {
  const breakMinutes = shift.breaks ? shift.breaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0) : 0;
  const scheduledDate = shift.scheduledStart ? shift.scheduledStart.split('T')[0] : '';

  return {
    ...shift,
    date: shift.date || scheduledDate,
    startTime: shift.actualClockIn || shift.scheduledStart,
    endTime: shift.status === 'active' ? null : (shift.actualClockOut || shift.scheduledEnd),
    breakMinutes: shift.breakMinutes !== undefined ? shift.breakMinutes : breakMinutes,
  };
}

/**
 * Creates seed shifts for the current week for hospitality staff.
 */
function createSeedShifts(userId: string, hourlyRate: number = 30): ShiftRecord[] {
  const monday = getStartOfWeek(new Date());

  // Helper to make a date on day offset (0 = Monday, 1 = Tuesday, ...)
  const makeDate = (dayOffset: number, hours: number, minutes: number = 0) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOffset);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  const rawSeeds: ShiftRecord[] = [
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

  return rawSeeds.map(normalizeShiftRecord);
}

async function loadPersistedShifts(): Promise<ShiftRecord[] | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    let json: string | null = null;

    if (isAvailable) {
      json = await SecureStore.getItemAsync(SHIFTS_STORAGE_KEY);
    } else if (isWebBrowser()) {
      json = window.localStorage.getItem(SHIFTS_STORAGE_KEY);
    }

    if (json) {
      const parsed: ShiftRecord[] = JSON.parse(json);
      return parsed.map(normalizeShiftRecord);
    }
  } catch (err) {
    console.warn('Failed to load persisted shifts:', err);
  }
  return null;
}

async function savePersistedShifts(shifts: ShiftRecord[]): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    const json = JSON.stringify(shifts);

    if (isAvailable) {
      await SecureStore.setItemAsync(SHIFTS_STORAGE_KEY, json);
    } else if (isWebBrowser()) {
      window.localStorage.setItem(SHIFTS_STORAGE_KEY, json);
    }
  } catch (err) {
    console.warn('Failed to persist shifts:', err);
  }
}

/**
 * In-memory fallback / cache for fast query operations
 */
let inMemoryShiftsCache: ShiftRecord[] | null = null;

export interface FetchShiftsOptions {
  weekStart?: string; // YYYY-MM-DD for GET /shifts?weekStart=YYYY-MM-DD
  hourlyRate?: number;
}

/**
 * Simulates GET /shifts?weekStart=YYYY-MM-DD
 * Fetches all shifts for a user, restoring persisted records or generating baseline seeds.
 */
export async function fetchShiftsApi(
  userId: string,
  optionsOrRate?: FetchShiftsOptions | number
): Promise<ShiftRecord[]> {
  // Support error simulation for demonstration and testing of retry UI
  const isGlobalError = typeof globalThis !== 'undefined' && Boolean((globalThis as any).__simulateShiftApiError);
  if (simulateApiError || isGlobalError) {
    throw new Error('Simulated network error: Unable to connect to shift server. Tap Retry to reconnect.');
  }

  // Reliable Network Check
  try {
    const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    if (isWeb) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Network offline');
      }
    } else {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected === false) {
        throw new Error('Network offline');
      }
    }
  } catch (e) {
    if (e instanceof Error && e.message === 'Network offline') {
      throw new Error('Network offline: No internet connection. Tap Retry to reconnect.');
    }
  } await new Promise((resolve) => setTimeout(resolve, 350));

  const options: FetchShiftsOptions = typeof optionsOrRate === 'number'
    ? { hourlyRate: optionsOrRate }
    : (optionsOrRate || {});

  const hourlyRate = options.hourlyRate ?? 30;

  if (!inMemoryShiftsCache) {
    const persisted = await loadPersistedShifts();
    if (persisted && persisted.length > 0) {
      inMemoryShiftsCache = persisted;
    } else {
      inMemoryShiftsCache = createSeedShifts(userId, hourlyRate);
      await savePersistedShifts(inMemoryShiftsCache);
    }
  }

  
  // Automatically mark past scheduled shifts as missed
  let cacheChanged = false;
  const nowTs = Date.now();
  if (inMemoryShiftsCache) {
    inMemoryShiftsCache = inMemoryShiftsCache.map(shift => {
      if (shift.status === 'scheduled') {
        const endTs = new Date(shift.scheduledEnd).getTime();
        if (!isNaN(endTs) && nowTs >= endTs) {
          cacheChanged = true;
          return { ...shift, status: 'missed' };
        }
      }
      return shift;
    });
    if (cacheChanged) {
      await savePersistedShifts(inMemoryShiftsCache);
    }
  }

  let result = [...inMemoryShiftsCache].filter((s) => s.userId === userId);


  // If weekStart parameter is provided (e.g. '2026-09-28'), filter shifts in that week
  if (options.weekStart) {
    const weekStartTs = new Date(`${options.weekStart}T00:00:00`).getTime();
    const weekEndTs = weekStartTs + 7 * 24 * 60 * 60 * 1000;
    result = result.filter((s) => {
      const shiftTs = new Date(s.scheduledStart).getTime();
      return shiftTs >= weekStartTs && shiftTs < weekEndTs;
    });
  }

  return result
    .map(normalizeShiftRecord)
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
}

/**
 * Simulates POST /shifts
 * Creates a new shift after validating start, end, and break times.
 */
export async function createShiftApi(
  userId: string,
  input: CreateShiftInput,
  hourlyRate: number = 30
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

  const newShift: ShiftRecord = normalizeShiftRecord({
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
  });

  if (!inMemoryShiftsCache) {
    inMemoryShiftsCache = (await loadPersistedShifts()) || createSeedShifts(userId, hourlyRate);
  }

  inMemoryShiftsCache.push(newShift);
  await savePersistedShifts(inMemoryShiftsCache);

  return newShift;
}

/**
 * Simulates PATCH /shifts/:id
 * Updates specific fields on an existing shift (e.g. ending shift, updating times, notes).
 */
export async function patchShiftApi(shiftId: string, updates: Partial<ShiftRecord>): Promise<ShiftRecord> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!inMemoryShiftsCache) {
    inMemoryShiftsCache = await loadPersistedShifts();
  }

  if (!inMemoryShiftsCache) {
    throw new Error('No shifts found.');
  }

  const index = inMemoryShiftsCache.findIndex((s) => s.id === shiftId);
  if (index === -1) {
    throw new Error('Shift not found.');
  }

  const existing = inMemoryShiftsCache[index];
  const updated: ShiftRecord = normalizeShiftRecord({
    ...existing,
    ...updates,
  });

  inMemoryShiftsCache[index] = updated;
  await savePersistedShifts(inMemoryShiftsCache);

  return updated;
}

/**
 * Starts a shift: marks actualClockIn with current timestamp and transitions status to 'active'.
 */
export async function startShiftApi(
  userId: string,
  shiftId?: string,
  hourlyRate: number = 30
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

    return patchShiftApi(shiftId, {
      actualClockIn: nowIso,
      status: 'active',
      endTime: null,
    });
  }

  // Create an ad-hoc active shift starting now
  const now = new Date();
  const scheduledEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000); // Default 6 hour shift

  const adHocShift: ShiftRecord = normalizeShiftRecord({
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
  });

  inMemoryShiftsCache.push(adHocShift);
  await savePersistedShifts(inMemoryShiftsCache);
  return adHocShift;
}

/**
 * Ends an active shift: sets actualClockOut and transitions status to 'completed'.
 * Directly utilizes patchShiftApi (simulating PATCH /shifts/:id).
 */
export async function endShiftApi(shiftId: string): Promise<ShiftRecord> {
  if (!inMemoryShiftsCache) {
    inMemoryShiftsCache = await loadPersistedShifts();
  }

  const shift = inMemoryShiftsCache?.find((s) => s.id === shiftId);
  if (!shift) {
    throw new Error('Shift not found.');
  }

  if (shift.status !== 'active') {
    throw new Error('Cannot end a shift that is not active.');
  }

  const nowIso = new Date().toISOString();
  return patchShiftApi(shiftId, {
    actualClockOut: nowIso,
    status: 'completed',
    endTime: nowIso,
  });
}
/**
 * Deletes a shift by ID. Useful for removing custom test shifts.
 */
export async function deleteShiftApi(shiftId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!inMemoryShiftsCache) {
    inMemoryShiftsCache = (await loadPersistedShifts()) || [];
  }

  inMemoryShiftsCache = inMemoryShiftsCache.filter((s) => s.id !== shiftId);
  await savePersistedShifts(inMemoryShiftsCache);
}

/**
 * Resets shifts data back to baseline seed shifts.
 */
export async function resetShiftsToSeedApi(
  userId: string,
  hourlyRate: number = 30
): Promise<ShiftRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const seeds = createSeedShifts(userId, hourlyRate);
  inMemoryShiftsCache = seeds;
  await savePersistedShifts(seeds);
  return seeds;
}
