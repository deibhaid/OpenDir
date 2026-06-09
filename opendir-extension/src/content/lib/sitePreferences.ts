import { pageKey } from '../../shared/pageKey';
import { ALL_EXTENSIONS_FILTER } from '../types';

const SITE_PREFS_KEY = 'opendir-site-browse-prefs';

export interface SiteBrowsePreferences {
  recursiveSearch?: boolean;
  extensionFilter?: string;
}

type SitePrefsStore = Record<string, SiteBrowsePreferences>;

export function getSitePreferencesKey(url: string = window.location.href): string {
  return pageKey(url);
}

export async function loadSiteBrowsePreferences(
  url: string = window.location.href,
): Promise<SiteBrowsePreferences> {
  const stored = await chrome.storage.local.get(SITE_PREFS_KEY);
  const all = (stored[SITE_PREFS_KEY] as SitePrefsStore | undefined) ?? {};
  return all[getSitePreferencesKey(url)] ?? {};
}

export async function saveSiteBrowsePreferences(
  partial: SiteBrowsePreferences,
  url: string = window.location.href,
): Promise<void> {
  const key = getSitePreferencesKey(url);
  const stored = await chrome.storage.local.get(SITE_PREFS_KEY);
  const all = { ...((stored[SITE_PREFS_KEY] as SitePrefsStore | undefined) ?? {}) };
  const current = all[key] ?? {};
  const next = { ...current, ...partial };

  if (next.extensionFilter === ALL_EXTENSIONS_FILTER) {
    delete next.extensionFilter;
  }

  if (Object.keys(next).length === 0) {
    delete all[key];
  } else {
    all[key] = next;
  }

  await chrome.storage.local.set({ [SITE_PREFS_KEY]: all });
}
