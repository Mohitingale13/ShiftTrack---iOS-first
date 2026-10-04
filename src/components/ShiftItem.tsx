import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { ShiftRecord } from '../types';
import { calculateNetDurationMinutes, formatDuration, formatTime } from '../utils/date';
import { calculateEarnings, formatCurrency } from '../utils/earnings';
import { borderRadius, colors, shadows, spacing } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface ShiftItemProps {
  shift: ShiftRecord;
  onClockIn?: (shiftId: string) => void;
  canClockIn?: boolean;
  onLongPress?: (shift: ShiftRecord) => void;
}

export function ShiftItem({ shift, onClockIn, canClockIn = false, onLongPress }: ShiftItemProps) {
  const breakDurationMinutes = shift.breaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

  const startIso = shift.actualClockIn || shift.scheduledStart;
  const endIso = shift.actualClockOut || shift.scheduledEnd;
  const netMinutes = calculateNetDurationMinutes(startIso, endIso, breakDurationMinutes);

  const isCompleted = shift.status === 'completed';
  const isActive = shift.status === 'active';
  const isScheduled = shift.status === 'scheduled';
  const isMissed = shift.status === 'missed';

  const dateObj = new Date(shift.scheduledStart);
  const weekday = dateObj.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
  const dayMonth = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const handleClockInPress = () => {
    hapticFeedback.medium();
    onClockIn?.(shift.id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onLongPress={() => {
        if (onLongPress) {
          hapticFeedback.warning();
          onLongPress(shift);
        }
      }}
      delayLongPress={500}
      style={[styles.container, isActive && styles.activeContainer]}
    >
      {Platform.OS !== 'web' && (
        <BlurView intensity={85} tint="light" experimentalBlurMethod="dimezisBlurView" style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.lg }]} />
      )}
      <View style={styles.mainRow}>
        {/* Left: Compact Date Badge */}
        <View style={[styles.dateBadge, isActive && styles.activeDateBadge]}>
          <Text style={[styles.dateWeekday, isActive && styles.activeDateText]}>{weekday}</Text>
          <Text style={[styles.dateDay, isActive && styles.activeDateText]}>{dayMonth}</Text>
        </View>

        {/* Center: Shift Details */}
        <View style={styles.detailsCol}>
          <Text style={styles.timeText}>
            {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.locationText}>{shift.location}</Text>
            {breakDurationMinutes > 0 && (
              <>
                <Text style={styles.dotSeparator}>{'\u2022'}</Text>
                <Text style={styles.breakText}>{breakDurationMinutes}m break</Text>
              </>
            )}
          </View>
        </View>

        {/* Right: Net Duration & Status Pill */}
        <View style={styles.statusCol}>
          <View
            style={[
              styles.statusPill,
              isActive && styles.activePill,
              isCompleted && styles.completedPill,
              isScheduled && styles.scheduledPill,
              isMissed && styles.missedPill,
            ]}
          >
            {isActive && <View style={styles.activeDot} />}
            <Text
              style={[
                styles.statusText,
                isActive && styles.activeStatusText,
                isCompleted && styles.completedStatusText,
                isScheduled && styles.scheduledStatusText,
                isMissed && styles.missedStatusText,
              ]}
            >
              {shift.status.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.durationText}>{formatDuration(netMinutes)}</Text>
          {isCompleted && (
            <Text style={styles.earningsText}>
              {typeof shift.hourlyRate === 'number' && shift.hourlyRate >= 0 ? formatCurrency(calculateEarnings(shift)) : 'Set hourly rate'}
            </Text>
          )}
        </View>
      </View>

      {Boolean(shift.notes) && (
        <Text style={styles.notesText}>Note: {shift.notes}</Text>
      )}

      {/* Start Shift Quick Action */}
      {isScheduled && canClockIn && onClockIn && (
        <TouchableOpacity
          style={styles.clockInAction}
          onPress={handleClockInPress}
          accessibilityRole="button"
          accessibilityLabel={`Clock in for shift on ${weekday}, ${dayMonth}`}
          activeOpacity={0.7}
        >
          <Text style={styles.clockInActionText}>Start This Shift</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.card,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.06)',
        } as any)
      : {}),
  },
  activeContainer: {
    borderColor: 'rgba(52, 199, 89, 0.40)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.25)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    minWidth: 54,
    marginRight: spacing.md,
  },
  activeDateBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  dateWeekday: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  activeDateText: {
    color: colors.success,
  },
  detailsCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dotSeparator: {
    fontSize: 10,
    color: colors.textTertiary,
    marginHorizontal: 5,
  },
  breakText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: spacing.xs + 4,
    borderRadius: borderRadius.pill,
    marginBottom: 4,
  },
  activePill: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  completedPill: {
    backgroundColor: 'rgba(100, 116, 139, 0.10)',
  },
  scheduledPill: {
    backgroundColor: 'rgba(10, 132, 255, 0.10)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  activeStatusText: {
    color: colors.success,
  },
  completedStatusText: {
    color: colors.textSecondary,
  },
  scheduledStatusText: {
    color: colors.primary,
  },

  missedPill: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
  },
  missedStatusText: {
    color: '#FF3B30',
  },
  earningsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
    marginTop: 2,
  },

  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  notesText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing.xs + 2,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  clockInAction: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs + 2,
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.20)',
  },
  clockInActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
