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
  name: 'Alex Morgan',
  email: 'staff@shifttrack.test',
  role: 'server',
  hourlyRate: 18.50,
};

const MOCK_TOKEN = 'mock-jwt-shifttrack-staff-token-2026';

/**
 * Mock authentication service function.
 * Validates credentials and returns an authentication token and user profile.
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate network latency (500ms)
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