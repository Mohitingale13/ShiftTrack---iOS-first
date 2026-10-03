import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShiftRecord } from '../types';
import { calculateElapsedTime } from '../utils/time';
import { formatTime } from '../utils/date';
import { borderRadius, colors, shadows, spacing } from '../theme';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface ActiveShiftCardProps {
  activeShift: ShiftRecord | null;
  onStartShift: () => void;
  onEndShift: (shiftId: string) => void;
  isLoading?: boolean;
}

export function ActiveShiftCard({
  activeShift,
  onStartShift,
  onEndShift,
  isLoading = false,
}: ActiveShiftCardProps) {
  const [elapsed, setElapsed] = useState<string>('00:00:00');

  useEffect(() => {
    if (!activeShift?.actualClockIn) {
      setElapsed('00:00:00');
      return;
    }

    const clockInIso = activeShift.actualClockIn;

    // Initial calculation based on persisted timestamp
    setElapsed(calculateElapsedTime(clockInIso).formatted);

    // Live update interval recalculating against wall-clock time
    const interval = setInterval(() => {
      setElapsed(calculateElapsedTime(clockInIso).formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeShift?.actualClockIn]);

  if (!activeShift) {
    return (
      <GlassCard style={styles.card}>
        <View style={styles.idleHeader}>
          <View style={styles.idleBadge}>
            <View style={styles.idleDot} />
            <Text style={styles.idleBadgeText}>NOT CLOCKED IN</Text>
          </View>
        </View>
        <Text style={styles.idleTitle}>No Active Shift</Text>
        <Text style={styles.idleSubtitle}>
          Start an active shift now or select a scheduled shift below to clock in.
        </Text>
        <Button
          title="Clock In Now"
          onPress={onStartShift}
          loading={isLoading}
          style={styles.startButton}
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard style={[styles.card, styles.activeBorder]}>
      <View style={styles.activeHeader}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>ACTIVE SHIFT</Text>
        </View>
        <Text style={styles.locationText}>{activeShift.location}</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>ELAPSED TIME</Text>
        <Text style={styles.timerDisplay}>{elapsed}</Text>
        <Text style={styles.clockInDetail}>
          Clocked in at {formatTime(activeShift.actualClockIn!)}
        </Text>
      </View>

      <Button
        title="End Shift"
        variant="danger"
        onPress={() => onEndShift(activeShift.id)}
        loading={isLoading}
        style={styles.endButton}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  activeBorder: {
    borderColor: 'rgba(48, 209, 88, 0.4)',
    borderWidth: 1.5,
  },
  idleHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  idleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fillQuaternary,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
  },
  idleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textTertiary,
    marginRight: spacing.xs + 2,
  },
  idleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  idleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  idleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  startButton: {
    marginTop: spacing.xs,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs + 2,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#248A3D',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  timerDisplay: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  clockInDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  endButton: {
    marginTop: spacing.xs,
  },
});