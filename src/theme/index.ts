/**
 * ShiftTrack Design Tokens
 * 
 * Apple iOS Light Frosted-Glass Visual Language:
 * - Crisp white canvas (#F8FAFC / #FFFFFF) with moving sapphire/cyan ambient spheres
 * - Translucent white glass surfaces (rgba(255,255,255,0.72 - 0.85)) with authentic blur
 * - Specular crisp hairline borders (rgba(255,255,255,0.85))
 * - High-contrast slate typography (#0F172A, #475569) meeting WCAG AA
 * - Standard iOS touch targets (minimum 44x44pt)
 */

export const colors = {
  // Brand & Accent (iOS Vibrant Blue)
  primary: '#0A84FF',
  primaryMuted: 'rgba(10, 132, 255, 0.12)',
  primaryGlow: 'rgba(10, 132, 255, 0.24)',
  accent: '#4F46E5',

  // Semantic Status Colors
  success: '#059669',
  successMuted: 'rgba(16, 185, 129, 0.12)',
  successBorder: 'rgba(16, 185, 129, 0.35)',

  warning: '#D97706',
  warningMuted: 'rgba(245, 158, 11, 0.12)',
  warningBorder: 'rgba(245, 158, 11, 0.35)',

  danger: '#DC2626',
  dangerMuted: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.35)',

  // White / Clean Canvas Backgrounds
  background: '#F8FAFC',
  backgroundSecondary: '#FFFFFF',
  backgroundGradient: ['#FFFFFF', '#F8FAFC', '#F1F5F9'] as const,

  // Frosted Glass Surfaces (iOS Light Mode Materials)
  glassSurface: 'rgba(255, 255, 255, 0.38)',
  glassSurfaceElevated: 'rgba(255, 255, 255, 0.50)',
  glassSurfaceHighlight: 'rgba(255, 255, 255, 0.95)',
  glassSurfaceSubtle: 'rgba(255, 255, 255, 0.25)',

  // Specular Hairline Borders
  glassBorder: 'rgba(255, 255, 255, 0.85)',
  glassBorderSubtle: 'rgba(226, 232, 240, 0.80)',
  glassBorderFocus: 'rgba(10, 132, 255, 0.55)',

  // Inputs
  inputBackground: 'rgba(255, 255, 255, 0.75)',
  inputBorder: 'rgba(203, 213, 225, 0.75)',

  // Typography (Dark Slate on Light Glass)
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Separators & Fills
  separator: 'rgba(226, 232, 240, 0.80)',
  fillQuaternary: 'rgba(241, 245, 249, 0.70)',
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
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 9999,
};

export const shadows = {
  glass: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  card: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  hero: {
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 6,
  },
};

export const layout = {
  minTouchTarget: 44,
  screenPaddingHorizontal: 20,
};