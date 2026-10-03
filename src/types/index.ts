/**
 * ShiftTrack Domain & Application Types
 */

export type UserRole = 'server' | 'bartender' | 'host' | 'cook' | 'manager';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hourlyRate: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserSession {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type ShiftStatus = 'scheduled' | 'active' | 'break' | 'completed' | 'cancelled';

export interface ShiftBreak {
  id: string;
  startTime: string; // ISO 8601
  endTime?: string;  // ISO 8601
  durationMinutes: number;
  isPaid: boolean;
}

export interface ShiftRecord {
  id: string;
  userId: string;
  role: UserRole;
  location: string;
  scheduledStart: string; // ISO 8601
  scheduledEnd: string;   // ISO 8601
  actualClockIn?: string; // ISO 8601
  actualClockOut?: string;// ISO 8601
  breaks: ShiftBreak[];
  hourlyRate: number;
  status: ShiftStatus;
  notes?: string;
}

export interface CreateShiftInput {
  scheduledStart: string; // ISO 8601
  scheduledEnd: string;   // ISO 8601
  breakDurationMinutes: number;
  role?: UserRole;
  location?: string;
  notes?: string;
}

export interface ShiftConflict {
  id: string;
  type: 'overlap' | 'unusually_long';
  severity: 'warning' | 'caution';
  shiftId1: string;
  shiftId2?: string;
  shift1Summary: string;
  shift2Summary?: string;
  message: string;
}

export interface ElapsedTime {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
}