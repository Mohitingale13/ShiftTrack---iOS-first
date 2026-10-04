import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export function ScreenBackground({ children, style, ...rest }: ScreenBackgroundProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      {/* Clean Apple White Canvas Base */}
      <View style={[StyleSheet.absoluteFill, styles.whiteCanvas]} />

      {/* Static Vibrant Ambient Elements for authentic Glassmorphism Refraction */}
      <View pointerEvents="none" style={styles.ambientLayer}>
        {/* 1. Top-Right Corner Cut Sphere (Royal Violet to Radiant Fuchsia) */}
        <View style={[styles.sphereBase, styles.topRightCorner]}>
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
          />
        </View>

        {/* 2. Bottom-Left Corner Cut Sphere (Emerald Teal to Electric Cyan) */}
        <View style={[styles.sphereBase, styles.bottomLeftCorner]}>
          <LinearGradient
            colors={['#0D9488', '#06B6D4']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
          />
        </View>

        {/* 3. Subtle Ambient Refraction Orb (Warm Sunset Amber to Coral glow kissing card perimeter) */}
        <View style={[styles.sphereBase, styles.perimeterRefraction]}>
          <LinearGradient
            colors={['#F59E0B', '#FB7185']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
          />
        </View>
      </View>

      {/* Screen Foreground Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  whiteCanvas: {
    backgroundColor: '#F8FAFC',
  },
  ambientLayer: {
    ...StyleSheet.absoluteFill,
    // Strictly preserve background Z-index on Android
    elevation: 0,
    zIndex: 0,
  },
  sphereBase: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
    // Zero elevation on Android ensures background shapes NEVER float above content
    elevation: 0,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 20px 50px rgba(37, 99, 235, 0.20)',
        } as any)
      : {
          shadowColor: '#2563EB',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 18,
        }),
  },
  // Corner 1: Cut off by top and right screen edges
  topRightCorner: {
    top: -130,
    right: -90,
    width: 320,
    height: 320,
    opacity: 0.78,
  },
  // Corner 2: Cut off by bottom and left screen edges
  bottomLeftCorner: {
    bottom: -90,
    left: -70,
    width: 350,
    height: 350,
    opacity: 0.75,
  },
  // Refraction Orb: Positioned at left edge to cast a gentle chromatic glow under the card rim
  perimeterRefraction: {
    top: '38%',
    left: -80,
    width: 280,
    height: 280,
    opacity: Platform.OS === 'android' ? 0.25 : 0.32,
  },
});