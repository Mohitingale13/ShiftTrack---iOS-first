import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, GlassCard } from '../../components';
import { useAuth } from '../../state/AuthContext';
import { borderRadius, colors, layout, spacing } from '../../theme';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ShiftTrack</Text>
          </View>
          <Text style={styles.title}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name ?? 'Staff Member'}</Text>
        </View>

        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role ? user.role.toUpperCase() : 'STAFF'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Hourly Rate</Text>
            <Text style={styles.rateValue}>
              ${user?.hourlyRate?.toFixed(2) ?? '0.00'} / hr
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Secure Session Active</Text>
          </View>
        </GlassCard>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Milestone 2 Active</Text>
          <Text style={styles.infoSubtitle}>
            Authentication and navigation architecture established. Shift management and timer workflows will follow in subsequent milestones.
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Sign Out"
            variant="danger"
            onPress={handleSignOut}
            loading={isLoggingOut}
            style={styles.signOutButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  card: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  roleBadge: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairlineBorder,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 'auto',
  },
  signOutButton: {
    width: '100%',
  },
});