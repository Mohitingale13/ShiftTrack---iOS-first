import * as Network from 'expo-network';
import { AuthResponse, LoginCredentials, UserProfile } from '../types';

/**
 * Assessment exact mock credentials
 */
const MOCK_CREDENTIALS = {
  email: 'staff@shifttrack.test',
  password: 'Password123',
};

const MOCK_USER: UserProfile = {
  id: 'usr_hosp_01',
  name: 'Mohit',
  email: 'staff@shifttrack.test',
  role: 'server',
  hourlyRate: 30,
};

const MOCK_TOKEN = 'mock-jwt-shifttrack-staff-token-2026';

/**
 * Mock authentication service function.
 * Validates credentials and returns an authentication token and user profile.
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
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
  }  // Simulate network latency (500ms)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const normalizedEmail = credentials.email.trim().toLowerCase();
  const normalizedExpected = MOCK_CREDENTIALS.email.toLowerCase();

  if (normalizedEmail === normalizedExpected && credentials.password === MOCK_CREDENTIALS.password) {
    return {
      token: MOCK_TOKEN,
      user: MOCK_USER,
    };
  }

  throw new Error('Invalid email or password. Please verify your credentials and try again.');
}

/**
 * Validates an active session token against the mock service.
 */
export async function validateTokenApi(token: string): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (token === MOCK_TOKEN) {
    return MOCK_USER;
  }

  throw new Error('Session token expired or invalid.');
}