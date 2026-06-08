import { LayoutGrid, LayoutList, X } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { ExtensionFilterSelect } from './ExtensionFilterSelect';
import { SettingsDropdown } from './SettingsDropdown';
import { useOpenDir } from '../context/OpenDirContext';
import { Button } from './ui/Button';

export function AppHeader() {
  const { search, setSearch, view, setView } = useOpenDir();

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border/70 bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 overflow-hidden">
          <Breadcrumb />
        </div>
        <div className="relative z-20 shrink-0">
          <SettingsDropdown />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <div className="flex h-10 items-stretch overflow-hidden rounded-lg border border-border/80 bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files and folders..."
              className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none"
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
            <div className="flex shrink-0 items-center border-l border-border/80 bg-muted/20">
              <ExtensionFilterSelect />
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant={view === 'grid' ? 'toolbarActive' : 'toolbar'}
            size="icon"
            title="Grid view"
            aria-label="Grid view"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'toolbarActive' : 'toolbar'}
            size="icon"
            title="List view"
            aria-label="List view"
            onClick={() => setView('list')}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
