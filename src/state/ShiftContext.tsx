import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CreateShiftInput, ShiftConflict, ShiftRecord } from '../types';
import { createShiftApi, endShiftApi, fetchShiftsApi, startShiftApi } from '../services/shifts';
import { detectShiftConflicts } from '../services/integrity';
import { isDateInCurrentWeek } from '../utils/date';
import { useAuth } from './AuthContext';

interface ShiftContextValue {
  shifts: ShiftRecord[];
  weeklyShifts: ShiftRecord[];
  activeShift: ShiftRecord | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  conflicts: ShiftConflict[];
  refreshShifts: () => Promise<void>;
  createShift: (input: CreateShiftInput) => Promise<ShiftRecord>;
  startShift: (shiftId?: string) => Promise<ShiftRecord>;
  endShift: (shiftId: string) => Promise<ShiftRecord>;
  clearError: () => void;
}

const ShiftContext = createContext<ShiftContextValue | undefined>(undefined);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeShift = useMemo(
    () => shifts.find((s) => s.status === 'active') || null,
    [shifts]
  );

  const weeklyShifts = useMemo(
    () => shifts.filter((s) => isDateInCurrentWeek(s.scheduledStart) || (s.actualClockIn && isDateInCurrentWeek(s.actualClockIn))),
    [shifts]
  );

  const conflicts = useMemo(
    () => detectShiftConflicts(shifts),
    [shifts]
  );

  const loadShifts = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchShiftsApi(user.id, user.hourlyRate);
      setShifts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load shifts.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadShifts();
    } else {
      setShifts([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const createShift = async (input: CreateShiftInput): Promise<ShiftRecord> => {
    if (!user) throw new Error('User must be logged in to create shifts.');
    setIsActionLoading(true);
    setError(null);
    try {
      const created = await createShiftApi(user.id, input, user.hourlyRate);
      setShifts((prev) => [...prev, created]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create shift.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const startShift = async (shiftId?: string): Promise<ShiftRecord> => {
    if (!user) throw new Error('User must be logged in to start shifts.');
    setIsActionLoading(true);
    setError(null);
    try {
      const updated = await startShiftApi(user.id, shiftId, user.hourlyRate);
      setShifts((prev) => {
        const index = prev.findIndex((s) => s.id === updated.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = updated;
          return copy;
        }
        return [...prev, updated];
      });
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start shift.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const endShift = async (shiftId: string): Promise<ShiftRecord> => {
    setIsActionLoading(true);
    setError(null);
    try {
      const completed = await endShiftApi(shiftId);
      setShifts((prev) =>
        prev.map((s) => (s.id === completed.id ? completed : s))
      );
      return completed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end shift.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = useMemo(
    () => ({
      shifts,
      weeklyShifts,
      activeShift,
      isLoading,
      isActionLoading,
      error,
      conflicts,
      refreshShifts: loadShifts,
      createShift,
      startShift,
      endShift,
      clearError,
    }),
    [shifts, weeklyShifts, activeShift, isLoading, isActionLoading, error, conflicts]
  );

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
}

export function useShifts(): ShiftContextValue {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
}