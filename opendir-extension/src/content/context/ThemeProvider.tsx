import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { ThemeMode } from '../types';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function resolveThemeMode(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/** Clear host directory-listing styles so dark-by-default servers do not leak through. */
export function prepareDocumentForOpenDir(theme: ThemeMode = 'light'): void {
  const root = document.documentElement;
  root.removeAttribute('class');
  root.style.removeProperty('color');
  root.style.removeProperty('background');
  root.style.removeProperty('background-color');
  root.style.removeProperty('color-scheme');

  document.body.innerHTML = '';
  document.body.removeAttribute('class');
  document.body.style.cssText = 'margin: 0';

  applyThemeClass(theme);
}

export function applyThemeClass(theme: ThemeMode): void {
  const root = document.documentElement;
  const resolved = resolveThemeMode(theme);

  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
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
