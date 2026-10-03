import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ActiveShiftCard,
  Button,
  GlassCard,
  IntegrityBanner,
  ShiftItem,
} from '../../components';
import { useAuth } from '../../state/AuthContext';
import { useShifts } from '../../state/ShiftContext';
import { formatShortDate, getEndOfWeek, getStartOfWeek } from '../../utils/date';
import { borderRadius, colors, layout, spacing } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    weeklyShifts,
    activeShift,
    isLoading,
    isActionLoading,
    error,
    conflicts,
    refreshShifts,
    startShift,
    endShift,
    clearError,
  } = useShifts();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshShifts();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleStartShift = async (shiftId?: string) => {
    clearError();
    try {
      await startShift(shiftId);
    } catch {
      // Error handled via ShiftContext error state
    }
  };

  const handleEndShift = async (shiftId: string) => {
    clearError();
    try {
      await endShift(shiftId);
    } catch {
      // Error handled via ShiftContext error state
    }
  };

  const weekStart = getStartOfWeek();
  const weekEnd = getEndOfWeek();
  const weekRangeLabel = `${formatShortDate(weekStart.toISOString())} – ${formatShortDate(weekEnd.toISOString())}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Staff Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ShiftTrack</Text>
            </View>
            <Text style={styles.title}>Hello, {user?.name?.split(' ')[0] ?? 'Staff'}</Text>
            <Text style={styles.roleSubtext}>
              {user?.role?.toUpperCase() ?? 'STAFF'} • ${user?.hourlyRate?.toFixed(2) ?? '0.00'}/hr
            </Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isLoggingOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out of account"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Text style={styles.signOutText}>Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Global Error Banner */}
        {Boolean(error) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Live Active Shift & Timer Section */}
        <ActiveShiftCard
          activeShift={activeShift}
          onStartShift={() => handleStartShift()}
          onEndShift={handleEndShift}
          isLoading={isActionLoading}
        />

        {/* Shift Integrity Assistant Conflict Alerts */}
        <IntegrityBanner conflicts={conflicts} />

        {/* Weekly Shifts Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <Text style={styles.sectionSubtitle}>{weekRangeLabel}</Text>
          </View>
          <Button
            title="+ Add Shift"
            variant="secondary"
            onPress={() => router.push('/(app)/create-shift')}
            style={styles.addShiftButton}
          />
        </View>

        {/* Weekly Shifts Content */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading weekly shifts...</Text>
          </View>
        ) : weeklyShifts.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Shifts This Week</Text>
            <Text style={styles.emptySubtitle}>
              You have no scheduled shifts for {weekRangeLabel}. Tap "+ Add Shift" above to record or schedule a shift.
            </Text>
            <Button
              title="Schedule a Shift"
              onPress={() => router.push('/(app)/create-shift')}
              style={styles.emptyAction}
            />
          </GlassCard>
        ) : (
          <View style={styles.shiftsList}>
            {weeklyShifts.map((shift) => (
              <ShiftItem
                key={shift.id}
                shift={shift}
                onClockIn={handleStartShift}
                canClockIn={!activeShift}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerInfo: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  roleSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.fillQuaternary,
    borderRadius: borderRadius.md,
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.25)',
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    flex: 1,
    fontWeight: '500',
  },
  retryButton: {
    paddingLeft: spacing.md,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addShiftButton: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyAction: {
    width: '100%',
  },
  shiftsList: {
    marginTop: spacing.xs,
  },
});