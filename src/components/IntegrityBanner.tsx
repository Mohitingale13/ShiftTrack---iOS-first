import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShiftConflict } from '../types';
import { borderRadius, colors, spacing } from '../theme';

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>INTEGRITY ASSISTANT</Text>
        </View>
        <Text style={styles.title}>
          {conflicts.length} {conflicts.length === 1 ? 'Notice' : 'Notices'} Detected
        </Text>
        <Text style={styles.toggleText}>{isExpanded ? 'Hide' : 'View'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {overlaps.map((conflict) => (
            <View key={conflict.id} style={styles.item}>
              <View style={[styles.indicator, styles.overlapIndicator]} />
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>Schedule Overlap Detected</Text>
                <Text style={styles.itemMessage}>{conflict.message}</Text>
              </View>
            </View>
          ))}

          {cautions.map((conflict) => (
            <View key={conflict.id} style={styles.item}>
              <View style={[styles.indicator, styles.cautionIndicator]} />
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>Shift Duration Caution</Text>
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
    backgroundColor: '#FFFBEA',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 159, 10, 0.35)',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(255, 159, 10, 0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B25E00',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#804400',
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
    borderTopColor: 'rgba(255, 159, 10, 0.15)',
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
    marginTop: 6,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#5C3100',
    marginBottom: 2,
  },
  itemMessage: {
    fontSize: 12,
    color: '#703C00',
    lineHeight: 17,
  },
});