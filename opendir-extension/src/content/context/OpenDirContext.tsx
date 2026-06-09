import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { downloadSelected as runBatchDownload } from '../download/batchDownload';
import { copySelectedUrls } from '../lib/clipboard';
import { applyFontFamily } from '../lib/fonts';
import { isPreviewableItem } from '../lib/preview';
import { searchRecursively } from '../lib/recursiveSearch';
import { loadSiteBrowsePreferences, saveSiteBrowsePreferences } from '../lib/sitePreferences';
import { getRangeHrefs } from '../lib/selection';
import {
  ALL_EXTENSIONS_FILTER,
  type DirectoryItem,
  type FontFamily,
  type OpenDirSettings,
  type SortColumn,
  type SortDir,
  type ThemeMode,
  type ThumbnailSettings,
  type ViewMode,
} from '../types';
import {
  getDirectoryExtensions,
  getFilteredSortedItems,
  countListingItems,
  getFooterText,
  getNextSortState,
  loadSettings,
  PAGE_SIZE,
  saveSetting,
} from './settings';
import { applyThemeClass, ThemeProvider } from './ThemeProvider';

interface OpenDirContextValue {
  items: DirectoryItem[];
  search: string;
  setSearch: (value: string) => void;
  recursiveSearch: boolean;
  setRecursiveSearch: (value: boolean) => void;
  recursiveSearchLoading: boolean;
  view: ViewMode;
  setView: (view: ViewMode) => void;
  thumbnails: ThumbnailSettings;
  setThumbnails: (value: ThumbnailSettings) => void;
  extensionFilter: string;
  setExtensionFilter: (filter: string) => void;
  directoryExtensions: string[];
  sortColumn: SortColumn;
  sortDir: SortDir;
  toggleSort: (column: SortColumn) => void;
  selectedHrefs: Set<string>;
  selectItem: (href: string, options?: { shiftKey?: boolean }) => void;
  toggleItemSelect: (href: string) => void;
  toggleSelected: (href: string) => void;
  selectAllVisible: () => void;
  clearSelection: () => void;
  downloadSelected: () => void;
  copySelectedUrls: () => Promise<boolean>;
  selectedItem: DirectoryItem | null;
  setSelectedItem: (item: DirectoryItem | null) => void;
  downloadDelayMs: number;
  setDownloadDelayMs: (value: number) => void;
  downloadRandom: boolean;
  setDownloadRandom: (value: boolean) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  font: FontFamily;
  setFont: (font: FontFamily) => void;
  pinParentDirectory: boolean;
  setPinParentDirectory: (value: boolean) => void;
  recursiveFilesOnly: boolean;
  setRecursiveFilesOnly: (value: boolean) => void;
  recursiveSortByPath: boolean;
  setRecursiveSortByPath: (value: boolean) => void;
  rememberSitePreferences: boolean;
  setRememberSitePreferences: (value: boolean) => void;
  focusedHref: string | null;
  filteredSortedItems: DirectoryItem[];
  visibleItems: DirectoryItem[];
  visibleCount: number;
  loadMore: () => void;
  hasMore: boolean;
  footerText: string;
  hasActiveFilter: boolean;
  allVisibleSelected: boolean;
  toggleSelectAllVisible: () => void;
  registerSearchInput: (element: HTMLInputElement | null) => void;
}

const OpenDirContext = createContext<OpenDirContextValue | null>(null);

export function OpenDirProvider({
  initialItems,
  children,
}: {
  initialItems: DirectoryItem[];
  children: React.ReactNode;
}) {
  const [items] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [recursiveSearch, setRecursiveSearchState] = useState(false);
  const [recursiveResults, setRecursiveResults] = useState<DirectoryItem[] | null>(null);
  const [recursiveDiscoveredItems, setRecursiveDiscoveredItems] = useState<DirectoryItem[]>([]);
  const [recursiveSearchLoading, setRecursiveSearchLoading] = useState(false);
  const [view, setViewState] = useState<ViewMode>('list');
  const [thumbnails, setThumbnailsState] = useState<OpenDirSettings['thumbnails']>({
    enabled: true,
    images: false,
    videos: false,
    text: true,
  });
  const [extensionFilter, setExtensionFilterState] = useState<string>(ALL_EXTENSIONS_FILTER);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedHrefs, setSelectedHrefs] = useState<Set<string>>(new Set());
  const selectionAnchorRef = useRef<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DirectoryItem | null>(null);
  const [downloadDelayMs, setDownloadDelayMsState] = useState(1500);
  const [downloadRandom, setDownloadRandomState] = useState(true);
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [font, setFontState] = useState<FontFamily>('mono');
  const [pinParentDirectory, setPinParentDirectoryState] = useState(false);
  const [recursiveFilesOnly, setRecursiveFilesOnlyState] = useState(false);
  const [recursiveSortByPath, setRecursiveSortByPathState] = useState(true);
  const [rememberSitePreferences, setRememberSitePreferencesState] = useState(true);
  const [focusedHref, setFocusedHref] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const rememberSitePreferencesRef = useRef(rememberSitePreferences);

  useEffect(() => {
    rememberSitePreferencesRef.current = rememberSitePreferences;
  }, [rememberSitePreferences]);

  useEffect(() => {
    void loadSettings().then(async (settings) => {
      setViewState(settings.view);
      setThumbnailsState(settings.thumbnails);
      setSortColumn(settings.sortColumn);
      setSortDir(settings.sortDir);
      setDownloadDelayMsState(settings.downloadDelayMs);
      setDownloadRandomState(settings.downloadRandom);
      setThemeState(settings.theme);
      applyThemeClass(settings.theme);
      setFontState(settings.font);
      applyFontFamily(settings.font);
      setPinParentDirectoryState(settings.pinParentDirectory);
      setRecursiveFilesOnlyState(settings.recursiveFilesOnly);
      setRecursiveSortByPathState(settings.recursiveSortByPath);
      setRememberSitePreferencesState(settings.rememberSitePreferences);

      if (settings.rememberSitePreferences) {
        const sitePrefs = await loadSiteBrowsePreferences();
        if (sitePrefs.recursiveSearch !== undefined) {
          setRecursiveSearchState(sitePrefs.recursiveSearch);
        }
        if (sitePrefs.extensionFilter !== undefined) {
          setExtensionFilterState(sitePrefs.extensionFilter);
        }
      }
    });
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    search,
    extensionFilter,
    sortColumn,
    sortDir,
    recursiveSearch,
    recursiveResults,
    recursiveFilesOnly,
    recursiveSortByPath,
    pinParentDirectory,
  ]);

  useEffect(() => {
    if (!recursiveSearch || !search.trim()) {
      setRecursiveResults(null);
      setRecursiveDiscoveredItems([]);
      setRecursiveSearchLoading(false);
      return;
    }

    setRecursiveResults(null);
    setRecursiveDiscoveredItems([]);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setRecursiveSearchLoading(true);
      void searchRecursively(items, window.location.href, search, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) {
            setRecursiveResults(results.matches);
            setRecursiveDiscoveredItems(results.discoveredItems);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setRecursiveSearchLoading(false);
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
      setRecursiveSearchLoading(false);
    };
  }, [recursiveSearch, search, items]);

  const listingItems = useMemo(() => {
    let list: DirectoryItem[];
    if (recursiveSearch && search.trim() && recursiveResults) {
      list = recursiveResults;
    } else {
      list = items;
    }

    if (recursiveSearch && search.trim() && recursiveFilesOnly) {
      list = list.filter((item) => item.isParent || item.type === 'file');
    }

    return list;
  }, [recursiveSearch, search, recursiveResults, items, recursiveFilesOnly]);

  const directoryExtensions = useMemo(() => {
    if (recursiveSearch && search.trim() && recursiveDiscoveredItems.length > 0) {
      return getDirectoryExtensions([...items, ...recursiveDiscoveredItems]);
    }
    return getDirectoryExtensions(items);
  }, [items, recursiveSearch, search, recursiveDiscoveredItems]);

  useEffect(() => {
    if (extensionFilter === ALL_EXTENSIONS_FILTER) return;
    const available = new Set(directoryExtensions.map((ext) => `*.${ext}`));
    if (!available.has(extensionFilter)) {
      setExtensionFilterState(ALL_EXTENSIONS_FILTER);
    }
  }, [directoryExtensions, extensionFilter]);

  const useRecursivePathSort = recursiveSearch && search.trim().length > 0 && recursiveSortByPath;

  const filteredSortedItems = useMemo(
    () =>
      getFilteredSortedItems(listingItems, search, extensionFilter, sortColumn, sortDir, {
        recursiveSortByPath: useRecursivePathSort,
      }),
    [listingItems, search, extensionFilter, sortColumn, sortDir, useRecursivePathSort],
  );

  const visibleItems = useMemo(
    () => filteredSortedItems.slice(0, visibleCount),
    [filteredSortedItems, visibleCount],
  );

  const hasMore = visibleCount < filteredSortedItems.length;
  const hasActiveFilter =
    search.trim().length > 0 ||
    extensionFilter !== ALL_EXTENSIONS_FILTER ||
    (recursiveSearch && search.trim().length > 0);
  const footerText = useMemo(() => {
    const base = getFooterText(countListingItems(filteredSortedItems), hasActiveFilter);
    if (recursiveSearchLoading) {
      return `${base} — searching subfolders…`;
    }
    if (recursiveSearch && search.trim()) {
      return `${base} (recursive)`;
    }
    return base;
  }, [filteredSortedItems, hasActiveFilter, recursiveSearchLoading, recursiveSearch, search]);

  const selectableVisibleItems = useMemo(
    () => visibleItems.filter((item) => !item.isParent),
    [visibleItems],
  );

  const allVisibleSelected =
    selectableVisibleItems.length > 0 &&
    selectableVisibleItems.every((item) => selectedHrefs.has(item.href));

  const persistSiteBrowsePreferences = useCallback(
    (partial: { recursiveSearch?: boolean; extensionFilter?: string }) => {
      if (!rememberSitePreferencesRef.current) return;
      void saveSiteBrowsePreferences(partial);
    },
    [],
  );

  const setRecursiveSearch = useCallback(
    (value: boolean) => {
      setRecursiveSearchState(value);
      persistSiteBrowsePreferences({ recursiveSearch: value });
    },
    [persistSiteBrowsePreferences],
  );

  const setExtensionFilter = useCallback(
    (filter: string) => {
      setExtensionFilterState(filter);
      persistSiteBrowsePreferences({ extensionFilter: filter });
    },
    [persistSiteBrowsePreferences],
  );

  const setView = useCallback((value: ViewMode) => {
    setViewState(value);
    void saveSetting('view', value);
  }, []);

  const setThumbnails = useCallback((value: ThumbnailSettings) => {
    setThumbnailsState(value);
    void saveSetting('thumbnails', value);
  }, []);

  const setDownloadDelayMs = useCallback((value: number) => {
    const clamped = Math.max(250, value);
    setDownloadDelayMsState(clamped);
    void saveSetting('downloadDelayMs', clamped);
  }, []);

  const setDownloadRandom = useCallback((value: boolean) => {
    setDownloadRandomState(value);
    void saveSetting('downloadRandom', value);
  }, []);

  const setTheme = useCallback((value: ThemeMode) => {
    setThemeState(value);
    applyThemeClass(value);
    void saveSetting('theme', value);
  }, []);

  const setFont = useCallback((value: FontFamily) => {
    setFontState(value);
    applyFontFamily(value);
    void saveSetting('font', value);
  }, []);

  const setPinParentDirectory = useCallback((value: boolean) => {
    setPinParentDirectoryState(value);
    void saveSetting('pinParentDirectory', value);
  }, []);

  const setRecursiveFilesOnly = useCallback((value: boolean) => {
    setRecursiveFilesOnlyState(value);
    void saveSetting('recursiveFilesOnly', value);
  }, []);

  const setRecursiveSortByPath = useCallback((value: boolean) => {
    setRecursiveSortByPathState(value);
    void saveSetting('recursiveSortByPath', value);
  }, []);

  const setRememberSitePreferences = useCallback((value: boolean) => {
    setRememberSitePreferencesState(value);
    void saveSetting('rememberSitePreferences', value);
  }, []);

  const toggleSort = useCallback(
    (column: SortColumn) => {
      const next = getNextSortState(sortColumn, sortDir, column);
      setSortColumn(next.sortColumn);
      setSortDir(next.sortDir);
      void saveSetting('sortColumn', next.sortColumn);
      void saveSetting('sortDir', next.sortDir);
    },
    [sortColumn, sortDir],
  );

  const toggleItemSelect = useCallback((href: string) => {
    setSelectedHrefs((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }, []);

  const selectItem = useCallback(
    (href: string, options?: { shiftKey?: boolean }) => {
      if (options?.shiftKey && selectionAnchorRef.current) {
        const rangeHrefs = getRangeHrefs(
          filteredSortedItems,
          selectionAnchorRef.current,
          href,
        );
        if (rangeHrefs.length > 0) {
          setSelectedHrefs((prev) => {
            const next = new Set(prev);
            for (const rangeHref of rangeHrefs) {
              next.add(rangeHref);
            }
            return next;
          });
          return;
        }
      }

      toggleItemSelect(href);
      selectionAnchorRef.current = href;
    },
    [filteredSortedItems, toggleItemSelect],
  );

  const selectAllVisible = useCallback(() => {
    setSelectedHrefs(new Set(selectableVisibleItems.map((item) => item.href)));
  }, [selectableVisibleItems]);

  const clearSelection = useCallback(() => {
    setSelectedHrefs(new Set());
    selectionAnchorRef.current = null;
  }, []);

  const toggleSelectAllVisible = useCallback(() => {
    if (allVisibleSelected) {
      clearSelection();
    } else {
      selectAllVisible();
    }
  }, [allVisibleSelected, clearSelection, selectAllVisible]);

  const downloadSelected = useCallback(() => {
    runBatchDownload(filteredSortedItems, selectedHrefs, downloadDelayMs, downloadRandom);
  }, [filteredSortedItems, selectedHrefs, downloadDelayMs, downloadRandom]);

  const copySelectedUrlsAction = useCallback(async () => {
    return copySelectedUrls(filteredSortedItems, selectedHrefs);
  }, [filteredSortedItems, selectedHrefs]);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + PAGE_SIZE);
  }, []);

  const registerSearchInput = useCallback((element: HTMLInputElement | null) => {
    searchInputRef.current = element;
  }, []);

  const activateFocusedItem = useCallback(
    (item: DirectoryItem) => {
      if (item.isParent || item.type === 'directory') {
        window.location.href = item.href;
        return;
      }
      if (isPreviewableItem(item)) {
        setSelectedItem(item);
        return;
      }
      window.open(item.href, '_self');
    },
    [],
  );

  useEffect(() => {
    if (focusedHref && !visibleItems.some((item) => item.href === focusedHref)) {
      setFocusedHref(null);
    }
  }, [focusedHref, visibleItems]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null);
          return;
        }
        clearSelection();
        setFocusedHref(null);
        return;
      }

      const target = event.target as HTMLElement | null;
      const inEditable =
        target != null &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (event.key === '/' && !inEditable && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (inEditable && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
        return;
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') {
        return;
      }

      if (visibleItems.length === 0) return;

      const currentIndex = focusedHref
        ? visibleItems.findIndex((item) => item.href === focusedHref)
        : -1;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const startIndex = currentIndex >= 0 ? currentIndex : event.key === 'ArrowDown' ? -1 : 0;
        const nextIndex = Math.max(0, Math.min(visibleItems.length - 1, startIndex + delta));
        setFocusedHref(visibleItems[nextIndex]?.href ?? null);
        return;
      }

      if (event.key === 'Enter' && currentIndex >= 0) {
        event.preventDefault();
        const item = visibleItems[currentIndex];
        if (item) activateFocusedItem(item);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activateFocusedItem, clearSelection, focusedHref, selectedItem, visibleItems]);

  const value: OpenDirContextValue = {
    items,
    search,
    setSearch,
    recursiveSearch,
    setRecursiveSearch,
    recursiveSearchLoading,
    view,
    setView,
    thumbnails,
    setThumbnails,
    extensionFilter,
    setExtensionFilter,
    directoryExtensions,
    sortColumn,
    sortDir,
    toggleSort,
    selectedHrefs,
    selectItem,
    toggleItemSelect,
    toggleSelected: toggleItemSelect,
    selectAllVisible,
    clearSelection,
    downloadSelected,
    copySelectedUrls: copySelectedUrlsAction,
    selectedItem,
    setSelectedItem,
    downloadDelayMs,
    setDownloadDelayMs,
    downloadRandom,
    setDownloadRandom,
    theme,
    setTheme,
    font,
    setFont,
    pinParentDirectory,
    setPinParentDirectory,
    recursiveFilesOnly,
    setRecursiveFilesOnly,
    recursiveSortByPath,
    setRecursiveSortByPath,
    rememberSitePreferences,
    setRememberSitePreferences,
    focusedHref,
    filteredSortedItems,
    visibleItems,
    visibleCount,
    loadMore,
    hasMore,
    footerText,
    hasActiveFilter,
    allVisibleSelected,
    toggleSelectAllVisible,
    registerSearchInput,
  };

  return (
    <OpenDirContext.Provider value={value}>
      <ThemeProvider theme={theme} setTheme={setTheme}>
        {children}
      </ThemeProvider>
    </OpenDirContext.Provider>
  );
}

export function useOpenDir(): OpenDirContextValue {
  const context = useContext(OpenDirContext);
  if (!context) throw new Error('useOpenDir must be used within OpenDirProvider');
  return context;
}

export { useTheme } from './ThemeProvider';
