import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button, GlassCard, Input, ScreenBackground } from '../../components';
import { useAuth } from '../../state/AuthContext';
import { borderRadius, colors, layout, spacing } from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

export default function LoginScreen() {
  const { signIn, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      hapticFeedback.error();
    }
    return isValid;
  };

  const handleLogin = async () => {
    if (clearError) {
      clearError();
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      hapticFeedback.success();
    } catch {
      hapticFeedback.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    hapticFeedback.light();
    setEmail('staff@shifttrack.test');
    setPassword('Password123');
    setValidationErrors({});
    if (clearError) {
      clearError();
    }
  };

  const isButtonDisabled = isSubmitting || !email.trim() || !password;

  return (
    <ScreenBackground style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header branding */}
            <View style={styles.headerContainer}>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>SHIFT TRACK</Text>
              </View>
              <Text style={styles.title}>Staff Sign In</Text>
              <Text style={styles.subtitle}>
                Access your scheduled shifts, log break times, and record live hours.
              </Text>
            </View>

            {/* Compact Centered Frosted Glass Card */}
            <GlassCard variant="elevated" style={styles.card}>
              {Boolean(authError) && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{authError}</Text>
                </View>
              )}

              <Input
                label="Email Address"
                placeholder="staff@shifttrack.test"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({ ...prev, email: undefined }));
                  }
                  if (authError && clearError) {
                    clearError();
                  }
                }}
                error={validationErrors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({ ...prev, password: undefined }));
                  }
                  if (authError && clearError) {
                    clearError();
                  }
                }}
                error={validationErrors.password}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isSubmitting}
                disabled={isButtonDisabled}
                style={styles.submitButton}
              />

              <TouchableOpacity
                onPress={handleFillDemoCredentials}
                style={styles.demoFillButton}
                accessibilityRole="button"
                accessibilityLabel="Auto-fill staff test credentials"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Text style={styles.demoFillText}>Auto-fill Staff Account</Text>
              </TouchableOpacity>
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerNote}>ShiftTrack Hospitality Management</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.85)',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' } as any)
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }),
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
    marginRight: spacing.xs + 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.6,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  card: {
    marginBottom: spacing.lg,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  errorBanner: {
    backgroundColor: colors.dangerMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  demoFillButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
  },
  demoFillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footerNote: {
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
});