import { Platform, Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;

export const LIGHT_COLORS = {
  bgPrimary: '#FAFAFA',
  bgSecondary: '#FFFFFF',
  bgSubtle: '#F5F3F0',
  textPrimary: '#1F1F1F',
  textSecondary: '#6B6B6B',
  textMuted: '#9CA3AF',
  accentPrimary: '#E85D75',
  accentSecondary: '#F4A261',
  accentSuccess: '#6BCB77',
  accentWarning: '#F59E0B',
  error: '#EF4444',
  accentSoft: '#FEF0F0',
  border: '#E8E8E8',
  white: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.06)',
  // Warning/Tip colors for light mode
  warningBg: '#FFFBEB',
  warningBorder: '#FCD34D',
  warningText: '#92400E',
  tipBg: '#FFFBEB',
  tipBorder: '#FCD34D',
  tipTitle: '#92400E',
  tipText: '#B45309',
};

export const DARK_COLORS = {
  bgPrimary: '#121212',
  bgSecondary: '#1E1E1E',
  bgSubtle: '#2A2A2A',
  textPrimary: '#F5F5F5',
  textSecondary: '#A1A1A1',
  textMuted: '#6B7280',
  accentPrimary: '#E85D75',
  accentSecondary: '#F4A261',
  accentSuccess: '#6BCB77',
  accentWarning: '#F59E0B',
  error: '#EF4444',
  accentSoft: '#3D2A2E',
  border: '#333333',
  white: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.3)',
  // Warning/Tip colors for dark mode
  warningBg: '#3D3520',
  warningBorder: '#92702A',
  warningText: '#FCD34D',
  tipBg: '#3D3520',
  tipBorder: '#92702A',
  tipTitle: '#FCD34D',
  tipText: '#E5C07A',
};

export const COLORS = LIGHT_COLORS;

export type ThemeColors = typeof LIGHT_COLORS;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const FONTS = {
  display: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif' }),
};
