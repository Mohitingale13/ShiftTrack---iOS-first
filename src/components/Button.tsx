import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { borderRadius, colors, layout, spacing } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
  style?: ViewStyle | ViewStyle[];
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  hapticStyle,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const isActionDisabled = disabled || loading;

  const handlePress = (e: GestureResponderEvent) => {
    if (!isActionDisabled) {
      if (hapticStyle === 'none') {
        // Suppress haptics if explicitly requested
      } else if (hapticStyle) {
        hapticFeedback[hapticStyle]();
      } else if (variant === 'danger') {
        hapticFeedback.heavy();
      } else if (variant === 'primary') {
        hapticFeedback.medium();
      } else {
        hapticFeedback.light();
      }
    }
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        variant === 'ghost' && styles.ghostButton,
        isActionDisabled && styles.disabledButton,
        style,
      ]}
      disabled={isActionDisabled}
      activeOpacity={0.75}
      onPress={handlePress}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? colors.primary : colors.textInverse}
        />
      ) : (
        <Text
          style={[
            styles.baseText,
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'danger' && styles.dangerText,
            variant === 'ghost' && styles.ghostText,
            isActionDisabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    minHeight: layout.minTouchTarget + 4,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px 0 rgba(10, 132, 255, 0.35)',
        } as any)
      : {}),
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.80)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        } as any)
      : {}),
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.45,
  },
  baseText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  primaryText: {
    color: colors.textInverse,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.danger,
  },
  ghostText: {
    color: colors.primary,
  },
  disabledText: {
    opacity: 0.8,
  },
});