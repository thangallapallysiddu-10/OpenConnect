import React, { createContext, useContext, useState } from 'react';
import { useColorScheme as rnUseColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

export const lightThemeColors = {
  background: '#FFFFFF',
  backgroundGradient: ['#F9FAFB', '#F3F4F6'] as [string, string],
  cardBackground: '#FFFFFF',
  cardBorder: '#F3F4F6',
  text: '#0F172A', // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94A3B8', // slate-400
  border: '#E2E8F0', // slate-200
  iconBg: '#EEF2FF', // Indigo 50
  iconColor: '#4F46E5', // Indigo 600
  chevronColor: '#6B7280', // grey-500
  headerBtnBg: 'rgba(0, 0, 0, 0.05)',
  headerBtnBorder: 'rgba(0, 0, 0, 0.08)',
  textWhite: '#FFFFFF',
  livePlayerBg: ['#F3E8FF', '#FAF5FF'] as [string, string],
  livePlayerBorder: '#E9D5FF', // purple-200
  livePlayerText: '#581C87', // purple-900
  livePlayerSubtext: '#701A75', // fuchsia-900
};

export const darkThemeColors = {
  background: '#0F0F14',
  backgroundGradient: ['#0F0F14', '#18181F'] as [string, string],
  cardBackground: '#18181F',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.1)',
  iconBg: 'rgba(139, 92, 246, 0.15)',
  iconColor: '#8B5CF6',
  chevronColor: '#A855F7',
  headerBtnBg: 'rgba(255, 255, 255, 0.05)',
  headerBtnBorder: 'rgba(255, 255, 255, 0.1)',
  textWhite: '#FFFFFF',
  livePlayerBg: ['#18181F', '#0F0F14'] as [string, string],
  livePlayerBorder: '#8B5CF6',
  livePlayerText: '#FFFFFF',
  livePlayerSubtext: '#A855F7',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof darkThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = rnUseColorScheme();
  // Default to 'dark' since the current project is a dark theme app
  const [theme, setThemeState] = useState<Theme>('dark');

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkThemeColors : lightThemeColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
