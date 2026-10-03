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

      {/* Static Vibrant Gradient Elements for high-definition Glassmorphism */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* 1. Top-Right Corner Cut Sphere */}
        <View style={[styles.sphereBase, styles.topRightCorner]}>
          <LinearGradient
            colors={['#1D4ED8', '#60A5FA']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
          />
        </View>

        {/* 2. Bottom-Left Corner Cut Sphere */}
        <View style={[styles.sphereBase, styles.bottomLeftCorner]}>
          <LinearGradient
            colors={['#0284C7', '#38BDF8']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
          />
        </View>

        {/* 3. Deep Purple/Indigo Orb (cuts deeply under the left side of the card) */}
        <View style={[styles.sphereBase, styles.cardLeftAccent]}>
          <LinearGradient
            colors={['#4F46E5', '#818CF8']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
          />
        </View>

        {/* 4. Electric Sky Blue Orb (cuts deeply under the right side of the card) */}
        <View style={[styles.sphereBase, styles.cardRightAccent]}>
          <LinearGradient
            colors={['#0284C7', '#60A5FA']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.2, y: 0.2 }}
            end={{ x: 0.8, y: 0.8 }}
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
  sphereBase: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 20px 50px rgba(37, 99, 235, 0.22)',
        } as any)
      : {
          shadowColor: '#2563EB',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 6,
        }),
  },
  // Corner 1: Cut off by top and right edges
  topRightCorner: {
    top: -100,
    right: -90,
    width: 350,
    height: 350,
    opacity: 0.90,
  },
  // Corner 2: Cut off by bottom and left edges
  bottomLeftCorner: {
    bottom: -110,
    left: -80,
    width: 370,
    height: 370,
    opacity: 0.85,
  },
  // Slices deeply behind the left of the card
  cardLeftAccent: {
    top: '25%',
    left: '50%',
    marginLeft: -280,
    width: 360,
    height: 360,
    opacity: 0.90,
  },
  // Slices deeply behind the right of the card
  cardRightAccent: {
    top: '46%',
    left: '50%',
    marginLeft: 40,
    width: 300,
    height: 300,
    opacity: 0.85,
  },
});