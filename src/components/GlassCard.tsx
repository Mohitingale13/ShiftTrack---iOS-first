import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function GlassCard({ children, style, ...rest }: GlassCardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassSurfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.hairlineBorder,
    ...shadows.glass,
  },
});