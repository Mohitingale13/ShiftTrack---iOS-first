import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, spacing } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  rightAction?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  rightAction,
  secureTextEntry,
  style,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry !== undefined;
  const actualSecureTextEntry = showPasswordToggle ? !isPasswordVisible : false;

  const handleTogglePassword = () => {
    hapticFeedback.selection();
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {Boolean(label) && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          Boolean(error) && styles.inputWrapperError,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={actualSecureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={colors.primary}
          {...rest}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={handleTogglePassword}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleButtonText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
        {rightAction}
      </View>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
      {Boolean(helperText) && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: borderRadius.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as any)
      : {}),
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 0 0 3px rgba(10, 132, 255, 0.20)',
        } as any)
      : {}),
  },
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(254, 242, 242, 0.85)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 44,
  },
  toggleButton: {
    paddingLeft: spacing.sm,
    justifyContent: 'center',
    minHeight: 44,
  },
  toggleButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});