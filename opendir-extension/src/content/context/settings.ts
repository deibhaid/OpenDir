import {
  DEFAULT_SETTINGS,
  ALL_EXTENSIONS_FILTER,
  type DirectoryItem,
  type OpenDirSettings,
  PAGE_SIZE,
  type SortColumn,
  type SortDir,
  type FontFamily,
  type ThemeMode,
  type ThumbnailSettings,
  type ViewMode,
} from '../types';
import { isFontFamily } from '../lib/fonts';
import { isPreviewableItem } from '../lib/preview';
import { parseDate } from '../parser/format';

const STORAGE_KEYS = {
  theme: 'opendir-theme',
  font: 'opendir-font',
  view: 'opendir-view',
  thumbnails: 'opendir-thumbnails',
  downloadDelayMs: 'opendir-downloadDelayMs',
  downloadRandom: 'opendir-downloadRandom',
  sortColumn: 'opendir-sortColumn',
  sortDir: 'opendir-sortDir',
} as const;

export async function loadSettings(): Promise<OpenDirSettings> {
  const stored = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
  return {
    theme: (stored[STORAGE_KEYS.theme] as ThemeMode) ?? DEFAULT_SETTINGS.theme,
    font: isFontFamily(stored[STORAGE_KEYS.font])
      ? stored[STORAGE_KEYS.font]
      : DEFAULT_SETTINGS.font,
    view: (stored[STORAGE_KEYS.view] as ViewMode) ?? DEFAULT_SETTINGS.view,
    thumbnails: (stored[STORAGE_KEYS.thumbnails] as ThumbnailSettings) ?? DEFAULT_SETTINGS.thumbnails,
    downloadDelayMs: (stored[STORAGE_KEYS.downloadDelayMs] as number) ?? DEFAULT_SETTINGS.downloadDelayMs,
    downloadRandom: (stored[STORAGE_KEYS.downloadRandom] as boolean) ?? DEFAULT_SETTINGS.downloadRandom,
    sortColumn: (stored[STORAGE_KEYS.sortColumn] as SortColumn) ?? DEFAULT_SETTINGS.sortColumn,
    sortDir: (stored[STORAGE_KEYS.sortDir] as SortDir) ?? DEFAULT_SETTINGS.sortDir,
  };
}

export async function saveSetting<K extends keyof OpenDirSettings>(
  key: K,
  value: OpenDirSettings[K],
): Promise<void> {
  const storageKey = STORAGE_KEYS[key as keyof typeof STORAGE_KEYS];
  if (storageKey) {
    await chrome.storage.local.set({ [storageKey]: value });
  }
}

export function getDirectoryExtensions(items: DirectoryItem[]): string[] {
  const exts = new Set<string>();
  for (const item of items) {
    if (item.isParent || item.type === 'directory' || !item.ext) continue;
    exts.add(item.ext.toLowerCase());
  }
  return Array.from(exts).sort((a, b) => a.localeCompare(b));
}

export function filterMatchesExtension(item: DirectoryItem, extensionFilter: string): boolean {
  if (item.isParent) return true;
  if (extensionFilter === ALL_EXTENSIONS_FILTER) return true;
  if (item.type === 'directory') return false;

  const normalized = extensionFilter.startsWith('*.')
    ? extensionFilter.slice(2).toLowerCase()
    : extensionFilter.toLowerCase();
  return (item.ext ?? '').toLowerCase() === normalized;
}

export function compareItems(a: DirectoryItem, b: DirectoryItem, column: SortColumn, dir: SortDir): number {
  const factor = dir === 'asc' ? 1 : -1;

  switch (column) {
    case 'name':
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) * factor;
    case 'ext':
      return (a.ext ?? '').localeCompare(b.ext ?? '', undefined, { sensitivity: 'base' }) * factor;
    case 'date': {
      const aDate = parseDate(a.created ?? a.modified)?.getTime();
      const bDate = parseDate(b.created ?? b.modified)?.getTime();
      if (aDate == null && bDate == null) return 0;
      if (aDate == null) return 1 * factor;
      if (bDate == null) return -1 * factor;
      return (aDate - bDate) * factor;
    }
    case 'size':
      return ((a.size ?? 0) - (b.size ?? 0)) * factor;
    default:
      return 0;
  }
}

export function getFilteredSortedItems(
  items: DirectoryItem[],
  search: string,
  extensionFilter: string,
  sortColumn: SortColumn,
  sortDir: SortDir,
): DirectoryItem[] {
  const query = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (item.isParent) return true;
    if (query && !item.name.toLowerCase().includes(query)) return false;
    return filterMatchesExtension(item, extensionFilter);
  });

  const parent = filtered.find((item) => item.isParent);
  const rest = filtered.filter((item) => !item.isParent);
  rest.sort((a, b) => compareItems(a, b, sortColumn, sortDir));
  return parent ? [parent, ...rest] : rest;
}

export function getPreviewableItems(items: DirectoryItem[]): DirectoryItem[] {
  return items.filter((item) => isPreviewableItem(item));
}

export function getDefaultSortDir(column: SortColumn): SortDir {
  return column === 'date' || column === 'size' ? 'desc' : 'asc';
}

export function getNextSortState(
  currentColumn: SortColumn,
  currentDir: SortDir,
  clickedColumn: SortColumn,
): { sortColumn: SortColumn; sortDir: SortDir } {
  if (currentColumn !== clickedColumn) {
    return { sortColumn: clickedColumn, sortDir: getDefaultSortDir(clickedColumn) };
  }
  return { sortColumn: clickedColumn, sortDir: currentDir === 'asc' ? 'desc' : 'asc' };
}

export function countListingItems(items: DirectoryItem[]): number {
  return items.filter((item) => !item.isParent).length;
}

export function getFooterText(totalFiltered: number, hasActiveFilter: boolean): string {
  const noun = totalFiltered === 1 ? 'item' : 'items';
  if (hasActiveFilter) return `Showing ${totalFiltered} ${noun}`;
  return `Showing all ${totalFiltered} ${noun}`;
}

export { PAGE_SIZE };
