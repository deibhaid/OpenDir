import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPageDisabled, setPageDisabled } from '../src/background/pagePreferences';

const DISABLED_PAGES_KEY = 'opendir-disabled-pages';
const store = new Map<string, unknown>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('chrome', {
    storage: {
      session: {
        get: vi.fn(async (key: string) => {
          const value = store.get(key);
          return value === undefined ? {} : { [key]: value };
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

describe('pagePreferences', () => {
  it('marks and clears disabled pages for the current session', async () => {
    const url = 'https://ftp5.gwdg.de/pub/';

    expect(await isPageDisabled(url)).toBe(false);

    await setPageDisabled(url, true);
    expect(await isPageDisabled(url)).toBe(true);
    expect(store.get(DISABLED_PAGES_KEY)).toEqual(['https://ftp5.gwdg.de/pub/']);

    await setPageDisabled(url, false);
    expect(await isPageDisabled(url)).toBe(false);
    expect(store.get(DISABLED_PAGES_KEY)).toEqual([]);
  });
});
