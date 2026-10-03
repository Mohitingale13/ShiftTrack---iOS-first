import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ShiftTrack</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.text}>Restoring session...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.glassSurfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairlineBorder,
    ...shadows.glass,
    minWidth: 220,
  },
  badge: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});