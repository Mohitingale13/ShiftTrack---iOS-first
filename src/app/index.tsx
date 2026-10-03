import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../state/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}