import * as SecureStore from 'expo-secure-store';
import { UserProfile } from '../types';

const TOKEN_KEY = 'shifttrack_auth_token';
const USER_KEY = 'shifttrack_user_profile';

/**
 * Storage service for session persistence.
 * Uses Expo SecureStore with graceful fallback for environments where SecureStore is unavailable.
 */
export async function saveSession(token: string, user: UserProfile): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.warn('Failed to securely persist session:', error);
  }
}

export async function getStoredSession(): Promise<{ token: string; user: UserProfile } | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) {
      return null;
    }
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userJson = await SecureStore.getItemAsync(USER_KEY);

    if (!token || !userJson) {
      return null;
    }

    const user: UserProfile = JSON.parse(userJson);
    return { token, user };
  } catch (error) {
    console.warn('Failed to restore session from secure store:', error);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.warn('Failed to clear session from secure store:', error);
  }
}