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
import { Button, GlassCard, Input } from '../../components';
import { useAuth } from '../../state/AuthContext';
import { borderRadius, colors, layout, spacing } from '../../theme';

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
    return Object.keys(errors).length === 0;
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
    } catch {
      // Auth error is captured in context and displayed via error banner
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('staff@shifttrack.test');
    setPassword('Password123');
    setValidationErrors({});
    if (clearError) {
      clearError();
    }
  };

  const isButtonDisabled = isSubmitting || !email.trim() || !password;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ShiftTrack</Text>
            </View>
            <Text style={styles.title}>Staff Sign In</Text>
            <Text style={styles.subtitle}>
              Log in to view and track your scheduled shifts and breaks.
            </Text>
          </View>

          <GlassCard style={styles.card}>
            {Boolean(authError) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{authError}</Text>
              </View>
            )}

            <Input
              label="Email"
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
              placeholder="••••••••••••"
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
              isPassword
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
              accessibilityLabel="Fill demo credentials"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.demoFillText}>Use Staff Demo Credentials</Text>
            </TouchableOpacity>
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              Assessment environment • Mock authentication
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  card: {
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.25)',
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
    fontWeight: '500',
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footerNote: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});