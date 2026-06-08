import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { ThemeMode } from '../types';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function applyThemeClass(theme: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
    return;
  }

  root.classList.add(theme);
}

export function ThemeProvider({
  theme,
  setTheme,
  children,
}: ThemeContextValue & { children: ReactNode }) {
  useEffect(() => {
    applyThemeClass(theme);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme === 'system') applyThemeClass('system');
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
