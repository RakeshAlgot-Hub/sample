import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, Fonts, Spacing, BorderRadius, Shadows } from '@/constants/Theme';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  colors: typeof LightColors;
  fonts: typeof Fonts;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  mode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');
  const colors = isDark ? DarkColors : LightColors;

  const value: ThemeContextType = {
    colors,
    fonts: Fonts,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    mode: themeMode,
    isDark,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
