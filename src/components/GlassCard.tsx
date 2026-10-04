import React from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { borderRadius, shadows, spacing } from '../theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'standard' | 'elevated' | 'subtle';
  intensity?: number;
}

export function GlassCard({
  children,
  style,
  variant = 'standard',
  intensity = 60,
  ...rest
}: GlassCardProps) {
  const isElevated = variant === 'elevated';
  const isSubtle = variant === 'subtle';

  return (
    <View
      style={[
        styles.outerContainer,
        isElevated && styles.elevatedContainer,
        isSubtle && styles.subtleContainer,
        style,
      ]}
      {...rest}
    >
      {/* On iOS use native UIVisualEffectView BlurView with translucent tint */}
      {Platform.OS !== 'web' && (
        <BlurView
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          intensity={isElevated ? 100 : 85}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl }]}
        />
      )}
      <View style={styles.innerContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)',
    ...shadows.glass,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(25px) saturate(190%)',
          WebkitBackdropFilter: 'blur(25px) saturate(190%)',
          boxShadow:
            '0 20px 48px 0 rgba(31, 38, 135, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.04), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 2px 0 rgba(255, 255, 255, 0.30)',
        } as any)
      : {}),
  },
  elevatedContainer: {
    borderColor: '#FFFFFF',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.25)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          boxShadow:
            '0 24px 60px 0 rgba(31, 38, 135, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.05), inset 0 2px 2.5px 0 #FFFFFF, inset 0 -1px 2px 0 rgba(255, 255, 255, 0.35)',
        } as any)
      : {}),
  },
  subtleContainer: {
    borderColor: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        } as any)
      : {}),
  },
  innerContent: {
    padding: spacing.lg,
  },
});