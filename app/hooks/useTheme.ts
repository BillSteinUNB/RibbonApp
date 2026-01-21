import { useColorScheme } from 'react-native';
import { useUIStore, selectTheme } from '../store/uiStore';
import { LIGHT_COLORS, DARK_COLORS, ThemeColors } from '../constants';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface UseThemeReturn {
  colors: ThemeColors;
  isDark: boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export function useTheme(): UseThemeReturn {
  const systemColorScheme = useColorScheme();
  const theme = useUIStore(selectTheme);
  const setTheme = useUIStore(state => state.setTheme);

  const isDark = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark');
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return {
    colors,
    isDark,
    theme,
    setTheme,
  };
}
