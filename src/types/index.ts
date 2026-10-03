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

export interface UserSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
}

export type ShiftStatus = 'scheduled' | 'active' | 'break' | 'completed' | 'cancelled';

export interface ShiftBreak {
  id: string;
  startTime: string; // ISO 8601
  endTime?: string;  // ISO 8601
  durationMinutes?: number;
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
