import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShiftConflict } from '../types';
import { borderRadius, colors, spacing } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface IntegrityBannerProps {
  conflicts: ShiftConflict[];
}

export function IntegrityBanner({ conflicts }: IntegrityBannerProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (conflicts.length === 0) {
    return null;
  }

  const overlaps = conflicts.filter((c) => c.type === 'overlap');
  const cautions = conflicts.filter((c) => c.type === 'unusually_long');

  const handleToggleExpand = () => {
    hapticFeedback.selection();
    setIsExpanded((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={handleToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>INTEGRITY</Text>
        </View>
        <Text style={styles.title}>
          {conflicts.length} Schedule {conflicts.length === 1 ? 'Notice' : 'Notices'}
        </Text>
        <Text style={styles.toggleText}>{isExpanded ? 'Collapse' : 'Details'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {overlaps.map((conflict) => (
            <View key={conflict.id} style={styles.item}>
              <View style={[styles.indicator, styles.overlapIndicator]} />
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>Shift Overlap</Text>
                <Text style={styles.itemMessage}>{conflict.message}</Text>
              </View>
            </View>
          ))}

          {cautions.map((conflict) => (
            <View key={conflict.id} style={styles.item}>
              <View style={[styles.indicator, styles.cautionIndicator]} />
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>Duration Caution</Text>
                <Text style={styles.itemMessage}>{conflict.message}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(254, 243, 199, 0.85)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.40)',
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 16px 0 rgba(245, 158, 11, 0.10)',
        } as any)
      : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.20)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm + 2,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    marginRight: spacing.sm,
  },
  overlapIndicator: {
    backgroundColor: colors.danger,
  },
  cautionIndicator: {
    backgroundColor: colors.warning,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  itemMessage: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
});