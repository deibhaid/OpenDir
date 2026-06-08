import {
  DEFAULT_SETTINGS,
  type DirectoryItem,
  type FilterType,
  type OpenDirSettings,
  PAGE_SIZE,
  PREVIEWABLE_FILE_TYPES,
  type SortColumn,
  type SortDir,
  type ThemeMode,
  type ThumbnailSettings,
  type ViewMode,
} from '../types';
import { parseDate } from '../parser/format';

const STORAGE_KEYS = {
  theme: 'opendir-theme',
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

export function filterMatchesType(item: DirectoryItem, filter: FilterType): boolean {
  if (item.isParent) return true;
  switch (filter) {
    case 'all':
      return true;
    case 'folders':
      return item.type === 'directory';
    case 'files':
      return item.type === 'file';
    case 'images':
      return item.fileType === 'image';
    case 'videos':
      return item.fileType === 'video';
    case 'audio':
      return item.fileType === 'audio';
    case 'documents':
      return item.fileType === 'document';
    case 'code':
      return item.fileType === 'code';
    case 'archives':
      return item.fileType === 'archive';
    default:
      return true;
  }
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
  filter: FilterType,
  sortColumn: SortColumn,
  sortDir: SortDir,
): DirectoryItem[] {
  const query = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (item.isParent) return true;
    if (query && !item.name.toLowerCase().includes(query)) return false;
    return filterMatchesType(item, filter);
  });

  const parent = filtered.find((item) => item.isParent);
  const rest = filtered.filter((item) => !item.isParent);
  rest.sort((a, b) => compareItems(a, b, sortColumn, sortDir));
  return parent ? [parent, ...rest] : rest;
}

export function getPreviewableItems(items: DirectoryItem[]): DirectoryItem[] {
  return items.filter(
    (item) => !item.isParent && item.type === 'file' && item.fileType && PREVIEWABLE_FILE_TYPES.has(item.fileType),
  );
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

export function getFooterText(totalFiltered: number, hasActiveFilter: boolean): string {
  const noun = totalFiltered === 1 ? 'item' : 'items';
  if (hasActiveFilter) return `Showing ${totalFiltered} ${noun}`;
  return `Showing all ${totalFiltered} ${noun}`;
}

export { PAGE_SIZE };
