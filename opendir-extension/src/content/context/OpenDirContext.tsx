import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { DirectoryItem, FilterType, OpenDirSettings, SortColumn, SortDir, ThemeMode, ThumbnailSettings, ViewMode } from '../types';
import {
  getFilteredSortedItems,
  getFooterText,
  getNextSortState,
  loadSettings,
  PAGE_SIZE,
  saveSetting,
} from './settings';

interface OpenDirContextValue {
  items: DirectoryItem[];
  search: string;
  setSearch: (value: string) => void;
  view: ViewMode;
  setView: (view: ViewMode) => void;
  thumbnails: ThumbnailSettings;
  setThumbnails: (value: ThumbnailSettings) => void;
  fileTypeFilter: FilterType;
  setFileTypeFilter: (filter: FilterType) => void;
  sortColumn: SortColumn;
  sortDir: SortDir;
  toggleSort: (column: SortColumn) => void;
  selectedHrefs: Set<string>;
  toggleSelected: (href: string) => void;
  selectAllVisible: () => void;
  clearSelection: () => void;
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

function applyThemeClass(theme: ThemeMode): void {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
}

export function OpenDirProvider({
  initialItems,
  children,
}: {
  initialItems: DirectoryItem[];
  children: React.ReactNode;
}) {
  const [items] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [view, setViewState] = useState<ViewMode>('list');
  const [thumbnails, setThumbnailsState] = useState<OpenDirSettings['thumbnails']>({ images: true, videos: false });
  const [fileTypeFilter, setFileTypeFilter] = useState<FilterType>('all');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedHrefs, setSelectedHrefs] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<DirectoryItem | null>(null);
  const [downloadDelayMs, setDownloadDelayMsState] = useState(1500);
  const [downloadRandom, setDownloadRandomState] = useState(true);
  const [theme, setThemeState] = useState<ThemeMode>('system');
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
    applyThemeClass(theme);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme === 'system') applyThemeClass('system');
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, fileTypeFilter, sortColumn, sortDir]);

  const filteredSortedItems = useMemo(
    () => getFilteredSortedItems(items, search, fileTypeFilter, sortColumn, sortDir),
    [items, search, fileTypeFilter, sortColumn, sortDir],
  );

  const visibleItems = useMemo(
    () => filteredSortedItems.slice(0, visibleCount),
    [filteredSortedItems, visibleCount],
  );

  const hasMore = visibleCount < filteredSortedItems.length;
  const hasActiveFilter = search.trim().length > 0 || fileTypeFilter !== 'all';
  const footerText = getFooterText(filteredSortedItems.length, hasActiveFilter);

  const allVisibleSelected = visibleItems.length > 0 &&
    visibleItems.every((item) => selectedHrefs.has(item.href));

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

  const toggleSort = useCallback((column: SortColumn) => {
    const next = getNextSortState(sortColumn, sortDir, column);
    setSortColumn(next.sortColumn);
    setSortDir(next.sortDir);
    void saveSetting('sortColumn', next.sortColumn);
    void saveSetting('sortDir', next.sortDir);
  }, [sortColumn, sortDir]);

  const toggleSelected = useCallback((href: string) => {
    setSelectedHrefs((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedHrefs(new Set(visibleItems.map((item) => item.href)));
  }, [visibleItems]);

  const clearSelection = useCallback(() => {
    setSelectedHrefs(new Set());
  }, []);

  const toggleSelectAllVisible = useCallback(() => {
    if (allVisibleSelected) {
      clearSelection();
    } else {
      selectAllVisible();
    }
  }, [allVisibleSelected, clearSelection, selectAllVisible]);

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
    view,
    setView,
    thumbnails,
    setThumbnails,
    fileTypeFilter,
    setFileTypeFilter,
    sortColumn,
    sortDir,
    toggleSort,
    selectedHrefs,
    toggleSelected,
    selectAllVisible,
    clearSelection,
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

  return <OpenDirContext.Provider value={value}>{children}</OpenDirContext.Provider>;
}

export function useOpenDir(): OpenDirContextValue {
  const context = useContext(OpenDirContext);
  if (!context) throw new Error('useOpenDir must be used within OpenDirProvider');
  return context;
}
