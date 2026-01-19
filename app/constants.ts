import { Platform, Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;

export const COLORS = {
  bgPrimary: '#FAFAFA',
  bgSecondary: '#FFFFFF',
  bgSubtle: '#F5F3F0',
  textPrimary: '#1F1F1F',
  textSecondary: '#6B6B6B',
  textMuted: '#9CA3AF',
  accentPrimary: '#E85D75',
  accentSecondary: '#F4A261',
  accentSuccess: '#6BCB77',
  error: '#EF4444',
  accentSoft: '#FEF0F0',
  border: '#E8E8E8',
  white: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.06)',
};

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
