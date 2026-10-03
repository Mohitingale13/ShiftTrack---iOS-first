import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthResponse, LoginCredentials, UserProfile } from '../types';
import { loginApi, validateTokenApi } from '../services/auth';
import { clearSession, getStoredSession, saveSession } from '../services/storage';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore stored session on mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const stored = await getStoredSession();
        if (stored && stored.token) {
          const validatedUser = await validateTokenApi(stored.token);
          if (isMounted) {
            setUser(validatedUser);
            setToken(stored.token);
          }
        }
      } catch {
        // Invalid or corrupted session, clear securely
        await clearSession();
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    setError(null);
    try {
      const response: AuthResponse = await loginApi(credentials);
      await saveSession(response.token, response.user);
      setUser(response.user);
      setToken(response.token);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await clearSession();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const clearError = () => setError(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      error,
      signIn,
      signOut,
      clearError,
    }),
    [user, token, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}