import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShiftRecord } from '../types';
import { calculateElapsedTime } from '../utils/time';
import { formatTime } from '../utils/date';
import { borderRadius, colors, spacing } from '../theme';
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
    setElapsed(calculateElapsedTime(clockInIso).formatted);

    const interval = setInterval(() => {
      setElapsed(calculateElapsedTime(clockInIso).formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeShift?.actualClockIn]);

  if (!activeShift) {
    return (
      <GlassCard variant="standard" style={styles.idleCard}>
        <View style={styles.idleHeader}>
          <View style={styles.idleBadge}>
            <View style={styles.idleDot} />
            <Text style={styles.idleBadgeText}>STANDBY</Text>
          </View>
          <Text style={styles.idleMeta}>Ready for duty</Text>
        </View>

        <Text style={styles.idleTitle}>No Active Shift</Text>
        <Text style={styles.idleSubtitle}>
          Clock in below to record live hours, or start an assigned shift from your schedule.
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
    <GlassCard variant="elevated" style={styles.activeCard}>
      {/* Top Status Bar */}
      <View style={styles.activeHeader}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE ACTIVE SHIFT</Text>
        </View>
        <View style={styles.locationPill}>
          <Text style={styles.locationText}>{activeShift.location.toUpperCase()}</Text>
        </View>
      </View>

      {/* Main Hero Elapsed Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>ELAPSED TIME</Text>
        <Text style={styles.timerDisplay}>{elapsed}</Text>
        <View style={styles.clockInRow}>
          <Text style={styles.clockInDetail}>
            Clocked in at <Text style={styles.clockInTime}>{formatTime(activeShift.actualClockIn!)}</Text>
          </Text>
        </View>
      </View>

      {/* Prominent End Shift Button */}
      <Button
        title="Clock Out & End Shift"
        variant="danger"
        onPress={() => onEndShift(activeShift.id)}
        loading={isLoading}
        style={styles.endButton}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  idleCard: {
    marginBottom: spacing.lg,
  },
  idleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  idleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  idleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textTertiary,
    marginRight: spacing.xs + 2,
  },
  idleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  idleMeta: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  idleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: spacing.xs,
  },
  idleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  startButton: {
    marginTop: spacing.xs,
  },
  activeCard: {
    marginBottom: spacing.lg,
    borderColor: 'rgba(16, 185, 129, 0.45)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
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
    backgroundColor: colors.successMuted,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs + 3,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.8,
  },
  locationPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  clockInRow: {
    marginTop: spacing.xs + 2,
  },
  clockInDetail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  clockInTime: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  endButton: {
    marginTop: spacing.xs,
  },
});