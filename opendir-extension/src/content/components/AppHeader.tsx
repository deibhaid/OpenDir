import { Infinity, LayoutGrid, LayoutList, X } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { ExtensionFilterSelect } from './ExtensionFilterSelect';
import { SettingsDropdown } from './SettingsDropdown';
import { useOpenDir } from '../context/OpenDirContext';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

export function AppHeader() {
  const {
    search,
    setSearch,
    recursiveSearch,
    setRecursiveSearch,
    view,
    setView,
    selectedHrefs,
    clearSelection,
    downloadSelected,
  } = useOpenDir();

  const selectionCount = selectedHrefs.size;
  const hasSelection = selectionCount > 0;

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border/70 bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <div className="min-w-0 overflow-hidden">
        <Breadcrumb />
      </div>

      <div
        className={cn(
          'grid h-10 grid-cols-[auto_minmax(10rem,1fr)_auto] items-center gap-2',
          hasSelection && 'rounded-lg bg-muted/30',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 overflow-hidden text-sm',
            hasSelection ? 'w-auto opacity-100' : 'pointer-events-none w-0 opacity-0',
          )}
          aria-hidden={!hasSelection}
        >
          <span className="whitespace-nowrap tabular-nums">{selectionCount} selected</span>
          <Button size="sm" onClick={downloadSelected} tabIndex={hasSelection ? 0 : -1}>
            Download selected
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            tabIndex={hasSelection ? 0 : -1}
          >
            Clear
          </Button>
        </div>

        <div className="relative min-w-0">
          <div className="flex h-10 items-stretch overflow-hidden rounded-lg border border-border/80 bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files and folders..."
              className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm leading-10 placeholder:text-muted-foreground/70 focus-visible:outline-none"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                title="Clear search"
                aria-label="Clear search"
                onClick={() => setSearch('')}
                className="h-10 w-9 shrink-0 rounded-none text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="flex h-full shrink-0 items-center border-l border-border/80">
              <Button
                variant={recursiveSearch ? 'toolbarActive' : 'toolbar'}
                size="icon"
                title="Search subfolders recursively"
                aria-label="Search subfolders recursively"
                aria-pressed={recursiveSearch}
                onClick={() => setRecursiveSearch(!recursiveSearch)}
                className="h-10 w-9 shrink-0 rounded-none"
              >
                <Infinity className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex h-full shrink-0 items-center border-l border-border/80 bg-muted/20">
              <ExtensionFilterSelect />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex h-10 shrink-0 items-center gap-1">
          <Button
            variant={view === 'grid' ? 'toolbarActive' : 'toolbar'}
            size="icon"
            title="Grid view"
            aria-label="Grid view"
            onClick={() => setView('grid')}
            className="h-10 w-10"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'toolbarActive' : 'toolbar'}
            size="icon"
            title="List view"
            aria-label="List view"
            onClick={() => setView('list')}
            className="h-10 w-10"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <SettingsDropdown />
        </div>
      </div>
    </header>
  );
}
