import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShiftRecord } from '../types';
import { calculateNetDurationMinutes, formatDuration, formatTime } from '../utils/date';
import { borderRadius, colors, spacing } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface ShiftItemProps {
  shift: ShiftRecord;
  onClockIn?: (shiftId: string) => void;
  canClockIn?: boolean;
}

export function ShiftItem({ shift, onClockIn, canClockIn = false }: ShiftItemProps) {
  const breakDurationMinutes = shift.breaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

  const startIso = shift.actualClockIn || shift.scheduledStart;
  const endIso = shift.actualClockOut || shift.scheduledEnd;
  const netMinutes = calculateNetDurationMinutes(startIso, endIso, breakDurationMinutes);

  const isCompleted = shift.status === 'completed';
  const isActive = shift.status === 'active';
  const isScheduled = shift.status === 'scheduled';

  const dateObj = new Date(shift.scheduledStart);
  const weekday = dateObj.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
  const dayMonth = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const handleClockInPress = () => {
    hapticFeedback.medium();
    onClockIn?.(shift.id);
  };

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
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
            ]}
          >
            {isActive && <View style={styles.activeDot} />}
            <Text
              style={[
                styles.statusText,
                isActive && styles.activeStatusText,
                isCompleted && styles.completedStatusText,
                isScheduled && styles.scheduledStatusText,
              ]}
            >
              {shift.status.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.durationText}>{formatDuration(netMinutes)}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(190%)',
          WebkitBackdropFilter: 'blur(20px) saturate(190%)',
          boxShadow: '0 4px 20px 0 rgba(31, 38, 135, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
        } as any)
      : {}),
  },
  activeContainer: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    marginRight: spacing.md,
  },
  activeDateBadge: {
    backgroundColor: colors.successMuted,
    borderColor: colors.successBorder,
  },
  dateWeekday: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  activeDateText: {
    color: colors.success,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dotSeparator: {
    fontSize: 12,
    color: colors.textTertiary,
    marginHorizontal: spacing.xs,
  },
  breakText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '500',
  },
  statusCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    marginBottom: 4,
    borderWidth: 1.5,
  },
  activePill: {
    backgroundColor: colors.successMuted,
    borderColor: colors.successBorder,
  },
  completedPill: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.30)',
  },
  scheduledPill: {
    backgroundColor: colors.primaryMuted,
    borderColor: 'rgba(10, 132, 255, 0.25)',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
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
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs + 2,
    paddingLeft: 66,
  },
  clockInAction: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    alignItems: 'center',
  },
  clockInActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});