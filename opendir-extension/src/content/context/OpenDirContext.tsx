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
import { searchRecursively } from '../lib/recursiveSearch';
import { getRangeHrefs } from '../lib/selection';
import {
  ALL_EXTENSIONS_FILTER,
  type DirectoryItem,
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
  selectedItem: DirectoryItem | null;
  setSelectedItem: (item: DirectoryItem | null) => void;
  downloadDelayMs: number;
  setDownloadDelayMs: (value: number) => void;
  downloadRandom: boolean;
  setDownloadRandom: (value: boolean) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  filteredSortedItems: DirectoryItem[];
  visibleItems: DirectoryItem[];
  visibleCount: number;
  loadMore: () => void;
  hasMore: boolean;
  footerText: string;
  hasActiveFilter: boolean;
  allVisibleSelected: boolean;
  toggleSelectAllVisible: () => void;
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
  const [recursiveSearch, setRecursiveSearch] = useState(false);
  const [recursiveResults, setRecursiveResults] = useState<DirectoryItem[] | null>(null);
  const [recursiveDiscoveredItems, setRecursiveDiscoveredItems] = useState<DirectoryItem[]>([]);
  const [recursiveSearchLoading, setRecursiveSearchLoading] = useState(false);
  const [view, setViewState] = useState<ViewMode>('list');
  const [thumbnails, setThumbnailsState] = useState<OpenDirSettings['thumbnails']>({
    images: false,
    videos: false,
  });
  const [extensionFilter, setExtensionFilter] = useState<string>(ALL_EXTENSIONS_FILTER);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedHrefs, setSelectedHrefs] = useState<Set<string>>(new Set());
  const selectionAnchorRef = useRef<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DirectoryItem | null>(null);
  const [downloadDelayMs, setDownloadDelayMsState] = useState(1500);
  const [downloadRandom, setDownloadRandomState] = useState(true);
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    void loadSettings().then((settings) => {
      setViewState(settings.view);
      setThumbnailsState(settings.thumbnails);
      setSortColumn(settings.sortColumn);
      setSortDir(settings.sortDir);
      setDownloadDelayMsState(settings.downloadDelayMs);
      setDownloadRandomState(settings.downloadRandom);
      setThemeState(settings.theme);
      applyThemeClass(settings.theme);
    });
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, extensionFilter, sortColumn, sortDir, recursiveSearch, recursiveResults]);

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
    if (recursiveSearch && search.trim() && recursiveResults) {
      return recursiveResults;
    }
    return items;
  }, [recursiveSearch, search, recursiveResults, items]);

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
      setExtensionFilter(ALL_EXTENSIONS_FILTER);
    }
  }, [directoryExtensions, extensionFilter]);

  const filteredSortedItems = useMemo(
    () => getFilteredSortedItems(listingItems, search, extensionFilter, sortColumn, sortDir),
    [listingItems, search, extensionFilter, sortColumn, sortDir],
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
    const base = getFooterText(filteredSortedItems.length, hasActiveFilter);
    if (recursiveSearchLoading) {
      return `${base} — searching subfolders…`;
    }
    if (recursiveSearch && search.trim()) {
      return `${base} (recursive)`;
    }
    return base;
  }, [filteredSortedItems.length, hasActiveFilter, recursiveSearchLoading, recursiveSearch, search]);

  const selectableVisibleItems = useMemo(
    () => visibleItems.filter((item) => !item.isParent),
    [visibleItems],
  );

  const allVisibleSelected =
    selectableVisibleItems.length > 0 &&
    selectableVisibleItems.every((item) => selectedHrefs.has(item.href));

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

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + PAGE_SIZE);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearSelection();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clearSelection]);

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
    selectedItem,
    setSelectedItem,
    downloadDelayMs,
    setDownloadDelayMs,
    downloadRandom,
    setDownloadRandom,
    theme,
    setTheme,
    filteredSortedItems,
    visibleItems,
    visibleCount,
    loadMore,
    hasMore,
    footerText,
    hasActiveFilter,
    allVisibleSelected,
    toggleSelectAllVisible,
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
