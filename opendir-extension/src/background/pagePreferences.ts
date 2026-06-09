import { pageKey } from './pageKey';

const DISABLED_PAGES_KEY = 'opendir-disabled-pages';

export async function isPageDisabled(url: string): Promise<boolean> {
  const stored = await chrome.storage.session.get(DISABLED_PAGES_KEY);
  const disabled = stored[DISABLED_PAGES_KEY] as string[] | undefined;
  return disabled?.includes(pageKey(url)) ?? false;
}

export async function setPageDisabled(url: string, disabled: boolean): Promise<void> {
  const key = pageKey(url);
  const stored = await chrome.storage.session.get(DISABLED_PAGES_KEY);
  const pages = new Set<string>((stored[DISABLED_PAGES_KEY] as string[] | undefined) ?? []);

  if (disabled) {
    pages.add(key);
  } else {
    pages.delete(key);
  }

  await chrome.storage.session.set({ [DISABLED_PAGES_KEY]: [...pages] });
}
