import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';
import { ScreenBackground } from './ScreenBackground';

export function LoadingScreen() {
  return (
    <ScreenBackground style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SHIFT TRACK</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.text}>Restoring session...</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.hero,
    minWidth: 220,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        } as any)
      : {}),
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.85)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});