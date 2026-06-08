import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Filter, LayoutGrid, LayoutList, X } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { SettingsDropdown } from './SettingsDropdown';
import { useOpenDir } from '../context/OpenDirContext';
import { getAppPortalContainer } from '../lib/portal';
import type { FilterType } from '../types';
import { Button } from './ui/Button';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'folders', label: 'Folders' },
  { value: 'files', label: 'Files' },
  { value: 'images', label: 'Images' },
  { value: 'videos', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'documents', label: 'Documents' },
  { value: 'code', label: 'Code' },
  { value: 'archives', label: 'Archives' },
];

export function AppHeader() {
  const { search, setSearch, view, setView, fileTypeFilter, setFileTypeFilter } = useOpenDir();
  const filterActive = fileTypeFilter !== 'all';

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
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search files and folders..."
            className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 pr-10 text-sm shadow-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              title="Clear search"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              className="absolute right-0.5 top-0.5 h-9 w-9 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant={filterActive ? 'toolbarActive' : 'toolbar'}
              size="icon"
              title="Filter by type"
              aria-label="Filter by type"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal container={getAppPortalContainer()}>
            <DropdownMenu.Content
              align="end"
              className="z-[100] min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-md"
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-medium">
                Filter by Type
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <RadioGroup.Root
                value={fileTypeFilter}
                onValueChange={(value) => setFileTypeFilter(value as FilterType)}
              >
                {FILTER_OPTIONS.map((option) => (
                  <DropdownMenu.Item
                    key={option.value}
                    className="cursor-pointer outline-none"
                    onSelect={(event) => event.preventDefault()}
                    asChild
                  >
                    <label className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                      <RadioGroup.Item
                        value={option.value}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-primary"
                      >
                        <RadioGroup.Indicator className="h-2 w-2 rounded-full bg-primary" />
                      </RadioGroup.Item>
                      {option.label}
                    </label>
                  </DropdownMenu.Item>
                ))}
              </RadioGroup.Root>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

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
