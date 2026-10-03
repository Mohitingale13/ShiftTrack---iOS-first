import * as SecureStore from 'expo-secure-store';
import { UserProfile } from '../types';

const TOKEN_KEY = 'shifttrack_auth_token';
const USER_KEY = 'shifttrack_user_profile';

/**
 * Storage service for session persistence.
 * Distinguishes native SecureStore (iOS Keychain / Android Keystore)
 * from Web Browser preview (localStorage fallback).
 */
function isWebBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export async function saveSession(token: string, user: UserProfile): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      // Native iOS Keychain / Android Keystore
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else if (isWebBrowser()) {
      // Browser preview persistence
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.warn('Failed to persist session:', error);
  }
}

export async function getStoredSession(): Promise<{ token: string; user: UserProfile } | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    let token: string | null = null;
    let userJson: string | null = null;

    if (isAvailable) {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
      userJson = await SecureStore.getItemAsync(USER_KEY);
    } else if (isWebBrowser()) {
      token = window.localStorage.getItem(TOKEN_KEY);
      userJson = window.localStorage.getItem(USER_KEY);
    }

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
    } else if (isWebBrowser()) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.warn('Failed to clear session from secure store:', error);
  }
}