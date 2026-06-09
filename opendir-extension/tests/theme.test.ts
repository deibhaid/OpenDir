import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyThemeClass,
  prepareDocumentForOpenDir,
  resolveThemeMode,
} from '../src/content/context/ThemeProvider';

describe('resolveThemeMode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns explicit light and dark modes', () => {
    expect(resolveThemeMode('light')).toBe('light');
    expect(resolveThemeMode('dark')).toBe('dark');
  });

  it('follows prefers-color-scheme for system mode', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    expect(resolveThemeMode('system')).toBe('dark');

    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    expect(resolveThemeMode('system')).toBe('light');
  });
});

describe('prepareDocumentForOpenDir', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('class');
    document.documentElement.removeAttribute('style');
    document.body.innerHTML = '';
    document.body.removeAttribute('class');
    document.body.removeAttribute('style');
  });

  it('clears host markup and applies the requested theme', () => {
    document.documentElement.className = 'dark-theme';
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.style.backgroundColor = '#181818';
    document.body.className = 'listing';
    document.body.style.backgroundColor = '#181818';
    document.body.innerHTML = '<table><tr><td>host listing</td></tr></table>';

    prepareDocumentForOpenDir('light');

    expect(document.body.innerHTML).toBe('');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(document.documentElement.style.backgroundColor).toBe('');
    expect(document.body.style.backgroundColor).toBe('');
  });

  it('can apply dark mode when requested', () => {
    prepareDocumentForOpenDir('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});

describe('applyThemeClass', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('class');
    document.documentElement.removeAttribute('style');
  });

  it('sets resolved class and color-scheme on the document root', () => {
    applyThemeClass('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
