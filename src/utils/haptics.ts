import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Native iOS-first haptic feedback utility for ShiftTrack.
 * Triggers Apple Taptic Engine patterns on iOS and falls back gracefully on Web / Android.
 */
export const hapticFeedback = {
  /**
   * Subtle tick for selection, chip switches, or toggles.
   */
  selection: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(8);
        }
        return;
      }
      Haptics.selectionAsync().catch(() => {});
    } catch {
      // Graceful fallback if haptics unavailable
    }
  },

  /**
   * Light impact for normal button touches, navigation taps, and secondary buttons.
   */
  light: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(12);
        }
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // Graceful fallback if haptics unavailable
    }
  },

  /**
   * Medium crisp impact for primary actions (Clock In, Save Shift, Log In).
   */
  medium: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(25);
        }
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {
      // Graceful fallback if haptics unavailable
    }
  },

  /**
   * Firm heavy impact for high-consequence touches (Clock Out, Sign Out, End Shift).
   */
  heavy: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(45);
        }
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    } catch {
      // Graceful fallback if haptics unavailable
    }
  },

  /**
   * Success notification double-pulse for successfully completed actions.
   */
  success: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([20, 40, 20]);
        }
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      // Graceful fallback if haptics unavailable
    }
  },

  /**
   * Warning notification pulse for integrity conflicts or alerts.
   */
  warning: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([30, 60, 30]);
        }
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch {
      // Graceful fallback if haptics unavailable
    }
  },

  /**
   * Error notification triple-pulse for validation failures or invalid credentials.
   */
  error: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([40, 60, 40, 60, 40]);
        }
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } catch {
      // Graceful fallback if haptics unavailable
    }
  },
};