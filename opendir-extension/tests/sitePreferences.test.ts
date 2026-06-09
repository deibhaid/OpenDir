import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSelectedFileUrls } from '../src/content/lib/clipboard';
import {
  loadSiteBrowsePreferences,
  saveSiteBrowsePreferences,
} from '../src/content/lib/sitePreferences';
import type { DirectoryItem } from '../src/content/types';

const SITE_PREFS_KEY = 'opendir-site-browse-prefs';
const store = new Map<string, unknown>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn(async (key: string | string[]) => {
          if (typeof key === 'string') {
            const value = store.get(key);
            return value === undefined ? {} : { [key]: value };
          }
          const result: Record<string, unknown> = {};
          for (const entry of key) {
            if (store.has(entry)) result[entry] = store.get(entry);
          }
          return result;
        }),
        set: vi.fn(async (values: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(values)) {
            store.set(key, value);
          }
        }),
      },
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('siteBrowsePreferences', () => {
  it('stores recursive search and extension filter per directory URL', async () => {
    const url = 'https://downloads.rainbowda.sh/movies/';

    await saveSiteBrowsePreferences({ recursiveSearch: true, extensionFilter: '*.jpg' }, url);
    await expect(loadSiteBrowsePreferences(url)).resolves.toEqual({
      recursiveSearch: true,
      extensionFilter: '*.jpg',
    });

    const all = store.get(SITE_PREFS_KEY) as Record<string, unknown>;
    expect(all['https://downloads.rainbowda.sh/movies/']).toEqual({
      recursiveSearch: true,
      extensionFilter: '*.jpg',
    });
  });
});

describe('getSelectedFileUrls', () => {
  it('returns only selected file URLs and excludes parent rows', () => {
    const items: DirectoryItem[] = [
      { name: '../', href: 'https://x/movies/../', type: 'directory', isParent: true },
      { name: 'a.jpg', href: 'https://x/movies/a.jpg', type: 'file', ext: 'jpg' },
      { name: 'b.mkv', href: 'https://x/movies/b.mkv', type: 'file', ext: 'mkv' },
    ];

    expect(getSelectedFileUrls(items, new Set(['https://x/movies/a.jpg']))).toEqual([
      'https://x/movies/a.jpg',
    ]);
  });
});
