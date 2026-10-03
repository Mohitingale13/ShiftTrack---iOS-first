import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShiftRecord } from '../types';
import { calculateNetDurationMinutes, formatDate, formatDuration, formatTime } from '../utils/date';
import { borderRadius, colors, spacing } from '../theme';

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

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.dateText}>{formatDate(shift.scheduledStart)}</Text>
          <Text style={styles.timeText}>
            {formatTime(shift.scheduledStart)} – {formatTime(shift.scheduledEnd)}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            isActive && styles.activePill,
            isCompleted && styles.completedPill,
            isScheduled && styles.scheduledPill,
          ]}
        >
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
      </View>

      <View style={styles.metaRow}>
        <View style={styles.detailBadge}>
          <Text style={styles.detailBadgeText}>
            Total: {formatDuration(netMinutes)}
          </Text>
        </View>

        {breakDurationMinutes > 0 && (
          <View style={[styles.detailBadge, styles.breakBadge]}>
            <Text style={styles.breakBadgeText}>
              Break: {breakDurationMinutes}m
            </Text>
          </View>
        )}

        <Text style={styles.locationText}>{shift.location}</Text>
      </View>

      {Boolean(shift.notes) && (
        <Text style={styles.notesText}>Note: {shift.notes}</Text>
      )}

      {isScheduled && canClockIn && onClockIn && (
        <TouchableOpacity
          style={styles.clockInAction}
          onPress={() => onClockIn(shift.id)}
          accessibilityRole="button"
          accessibilityLabel={`Clock in for shift on ${formatDate(shift.scheduledStart)}`}
        >
          <Text style={styles.clockInActionText}>Start This Shift</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.hairlineBorder,
  },
  activeContainer: {
    borderColor: colors.success,
    backgroundColor: 'rgba(48, 209, 88, 0.04)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs + 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  activePill: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
  },
  completedPill: {
    backgroundColor: colors.fillQuaternary,
  },
  scheduledPill: {
    backgroundColor: colors.primaryMuted,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  activeStatusText: {
    color: '#248A3D',
  },
  completedStatusText: {
    color: colors.textSecondary,
  },
  scheduledStatusText: {
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  detailBadge: {
    backgroundColor: colors.fillQuaternary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breakBadge: {
    backgroundColor: 'rgba(255, 159, 10, 0.12)',
  },
  breakBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C97500',
  },
  locationText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 'auto',
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs + 2,
  },
  clockInAction: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    alignItems: 'center',
  },
  clockInActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});