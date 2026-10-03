/**
 * ShiftTrack Design Tokens
 * 
 * Native-feeling iOS visual language with restrained frosted-glass materials:
 * - Translucent surfaces with subtle depth and 1px hairline borders
 * - Accessible contrast ratios meeting WCAG AA standards
 * - Predictable fallbacks for environments where native blur is unavailable
 * - Standard iOS touch targets (minimum 44x44pt)
 */

export const colors = {
  // Brand & Accent
  primary: '#0A84FF',
  primaryMuted: 'rgba(10, 132, 255, 0.15)',
  accent: '#5E5CE6',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',

  // Backgrounds
  background: '#F2F2F7',
  backgroundDark: '#000000',

  // Glass & Surface materials (iOS Human Interface Guidelines style)
  glassSurface: 'rgba(255, 255, 255, 0.78)',
  glassSurfaceElevated: 'rgba(255, 255, 255, 0.90)',
  glassBorder: 'rgba(255, 255, 255, 0.65)',
  hairlineBorder: 'rgba(60, 60, 67, 0.12)',

  // Dark mode glass materials
  glassSurfaceDark: 'rgba(30, 30, 32, 0.75)',
  glassBorderDark: 'rgba(255, 255, 255, 0.12)',
  hairlineBorderDark: 'rgba(255, 255, 255, 0.15)',

  // Typography
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#8E8E93',
  textInverse: '#FFFFFF',

  // Separators & fills
  separator: 'rgba(60, 60, 67, 0.18)',
  fillQuaternary: 'rgba(120, 120, 128, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 9999,
};

export const shadows = {
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const layout = {
  minTouchTarget: 44,
  screenPaddingHorizontal: 20,
};
