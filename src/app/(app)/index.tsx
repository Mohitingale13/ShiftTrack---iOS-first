import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActiveShiftCard,
  Button,
  GlassCard,
  IntegrityBanner,
  ScreenBackground,
  ShiftItem,
} from '../../components';
import { useAuth } from '../../state/AuthContext';
import { useShifts } from '../../state/ShiftContext';
import { ShiftRecord } from '../../types';
import { formatShortDate, formatTime, getEndOfWeek, getStartOfWeek } from '../../utils/date';
import { calculateEarnings, formatCurrency } from '../../utils/earnings';
import { borderRadius, colors, layout, spacing } from '../../theme';
import { hapticFeedback } from '../../utils/haptics';
import { isSimulateShiftApiError, setSimulateShiftApiError } from '../../services';

function formatRoleTitle(role?: string): string {
  switch (role?.toLowerCase()) {
    case 'server':
      return 'Service Staff';
    case 'bartender':
      return 'Bartender';
    case 'host':
      return 'Host';
    case 'cook':
      return 'Kitchen Staff';
    case 'manager':
      return 'Shift Manager';
    default:
      return 'Service Staff';
  }
}

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
    deleteShift,
    resetShifts,
    clearError,
  } = useShifts();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRefresh = async () => {
    hapticFeedback.light();
    setIsRefreshing(true);
    try {
      await refreshShifts();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    hapticFeedback.heavy();
    setIsLoggingOut(true);
    try {
      await signOut();
      hapticFeedback.success();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleStartShift = async (shiftId?: string) => {
    hapticFeedback.medium();
    clearError();
    try {
      await startShift(shiftId);
      hapticFeedback.success();
    } catch {
      hapticFeedback.error();
    }
  };

  const handleEndShift = async (shiftId: string) => {
    hapticFeedback.heavy();
    clearError();
    try {
      await endShift(shiftId);
      hapticFeedback.success();
    } catch {
      hapticFeedback.error();
    }
  };

  const handleDeleteShiftPrompt = (shift: ShiftRecord) => {
    if (shift.status === 'active') {
      const msg = 'You cannot delete a shift while it is actively in progress. Clock out first.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Active Shift', msg);
      }
      return;
    }

    hapticFeedback.warning();
    const title = 'Delete Shift';
    const message = "Delete test shift for " + formatShortDate(shift.scheduledStart) + " (" + formatTime(shift.scheduledStart) + " - " + formatTime(shift.scheduledEnd) + ")?";

    if (Platform.OS === 'web') {
      if (window.confirm(title + "\n\n" + message)) {
        deleteShift(shift.id)
          .then(() => hapticFeedback.success())
          .catch(() => hapticFeedback.error());
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteShift(shift.id);
            hapticFeedback.success();
          } catch {
            hapticFeedback.error();
          }
        },
      },
    ]);
  };

  const handleResetSchedulePrompt = () => {
    hapticFeedback.warning();
    const title = 'Reset Test Schedule?';
    const message = 'Restore all default seed shifts and remove custom test shifts created during testing?';

    if (Platform.OS === 'web') {
      if (window.confirm(title + "\n\n" + message)) {
        resetShifts()
          .then(() => hapticFeedback.success())
          .catch(() => hapticFeedback.error());
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset to Defaults',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetShifts();
            hapticFeedback.success();
          } catch {
            hapticFeedback.error();
          }
        },
      },
    ]);
  };

  const handleToggleSimulateError = () => {
    const next = !isSimulateShiftApiError();
    setSimulateShiftApiError(next);
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__simulateShiftApiError = next;
    }
    if (next) {
      hapticFeedback.warning();
    } else {
      hapticFeedback.success();
    }
    handleRefresh();
  };


  const weekStart = getStartOfWeek();
  const weekEnd = getEndOfWeek();
  const weekRangeLabel = formatShortDate(weekStart.toISOString()) + " - " + formatShortDate(weekEnd.toISOString());

  const completedShifts = weeklyShifts.filter((s: ShiftRecord) => s.status === 'completed');
  const weeklyEarningsAmount = completedShifts.reduce((total: number, s: ShiftRecord) => total + (calculateEarnings(s) || 0), 0);


  return (
    <ScreenBackground style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Top Profile Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.badgeRow}>
                <TouchableOpacity
                  onLongPress={handleToggleSimulateError}
                  delayLongPress={700}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Hold to toggle simulated network error for demo"
                >
                  <View style={styles.sessionBadge}>
                    <View style={styles.sessionDot} />
                    <Text style={styles.sessionText}>STAFF PORTAL</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>{formatRoleTitle(user?.role) + " - Rs. " + (user?.hourlyRate || '30') + "/hr"}</Text>
                </View>
              </View>

              <Text style={styles.userName}>{user?.name ?? 'Mohit'}</Text>
            </View>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              disabled={isLoggingOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out of account"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signOutText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Global Error Banner */}
          {Boolean(error) && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.medium();
                  handleRefresh();
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Focal Hero Component: Active Shift & Live Elapsed Timer */}
          <ActiveShiftCard
            activeShift={activeShift}
            onStartShift={() => handleStartShift()}
            onEndShift={handleEndShift}
            isLoading={isActionLoading}
          />

          {/* Shift Integrity Assistant Conflict Alerts */}
          <IntegrityBanner conflicts={conflicts} />

          {/* Weekly Schedule Section */}
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onLongPress={handleResetSchedulePrompt}
              delayLongPress={700}
              accessibilityRole="button"
              accessibilityLabel="Hold to reset test schedule to defaults"
            >
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} style={{ marginRight: 6, marginBottom: 2 }} />
                <Text style={styles.sectionTitle}>Weekly Schedule</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text style={styles.sectionSubtitle}>{weekRangeLabel}</Text>
                {weeklyEarningsAmount > 0 && (
                  <Text style={styles.weeklyEarningsText}>Total: {formatCurrency(weeklyEarningsAmount)}</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addShiftButton}
              onPress={() => {
                hapticFeedback.light();
                router.push('/(app)/create-shift');
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Schedule new shift"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="add-circle" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.addShiftText}>Add Shift</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Weekly Shifts List */}
          {isLoading && !isRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Updating shifts...</Text>
            </View>
          ) : weeklyShifts.length === 0 ? (
            <GlassCard variant="standard" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Shifts This Week</Text>
              <Text style={styles.emptySubtitle}>
                You have no scheduled shifts for {weekRangeLabel}. Tap "+ Add Shift" above to record or schedule a shift.
              </Text>
              <Button
                title="Schedule a Shift"
                onPress={() => {
                  hapticFeedback.light();
                  router.push('/(app)/create-shift');
                }}
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
                  onLongPress={handleDeleteShiftPrompt}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.xs + 2,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.85)',
    elevation: 1,
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' } as any) : {}),
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.xs + 2,
  },
  sessionText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  rateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.85)',
    elevation: 1,
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' } as any) : {}),
  },
  rateText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  signOutButton: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.xs + 3,
    backgroundColor: '#DC2626',
    borderRadius: borderRadius.md,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
        boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.35)',
      } as any)
      : {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      }),
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  errorBanner: {
    backgroundColor: colors.dangerMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    flex: 1,
    fontWeight: '600',
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
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
    fontWeight: '500',
  },
  addShiftButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addShiftText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
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
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  emptyAction: {
    width: '100%',
  },
  shiftsList: {
    marginTop: spacing.xs,
  },
  weeklyEarningsText: { fontSize: 13, fontWeight: '700', color: '#34C759' },
});
