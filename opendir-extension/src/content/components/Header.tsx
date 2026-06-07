import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, LayoutGrid, LayoutList, Settings2 } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { useOpenDir } from '../context/OpenDirContext';
import type { FilterType, ThemeMode } from '../types';
import { cn } from '../lib/utils';

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

export function Header() {
  const {
    search,
    setSearch,
    view,
    setView,
    fileTypeFilter,
    setFileTypeFilter,
    theme,
    setTheme,
    thumbnails,
    setThumbnails,
    downloadDelayMs,
    setDownloadDelayMs,
    downloadRandom,
    setDownloadRandom,
  } = useOpenDir();

  const currentFilterLabel = FILTER_OPTIONS.find((option) => option.value === fileTypeFilter)?.label ?? 'All Items';

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-lg font-semibold">OpenDir</div>
            <Breadcrumb />
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
                aria-label="Settings"
              >
                <Settings2 className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-[min(720px,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-lg"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="mb-2 text-sm font-medium">Theme</div>
                    <RadioGroup.Root
                      value={theme}
                      onValueChange={(value) => setTheme(value as ThemeMode)}
                      className="space-y-2"
                    >
                      {(['light', 'dark', 'system'] as ThemeMode[]).map((option) => (
                        <label key={option} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
                          <RadioGroup.Item
                            value={option}
                            className="flex h-4 w-4 items-center justify-center rounded-full border border-primary"
                          >
                            <RadioGroup.Indicator>
                              <Check className="h-3 w-3 text-primary" />
                            </RadioGroup.Indicator>
                          </RadioGroup.Item>
                          {option}
                        </label>
                      ))}
                    </RadioGroup.Root>
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-medium">Thumbnails</div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox.Root
                          checked={thumbnails.images}
                          onCheckedChange={(checked) =>
                            setThumbnails({ ...thumbnails, images: checked === true })
                          }
                          className="flex h-4 w-4 items-center justify-center rounded border border-primary"
                        >
                          <Checkbox.Indicator>
                            <Check className="h-3 w-3" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        Images
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox.Root
                          checked={thumbnails.videos}
                          onCheckedChange={(checked) =>
                            setThumbnails({ ...thumbnails, videos: checked === true })
                          }
                          className="flex h-4 w-4 items-center justify-center rounded border border-primary"
                        >
                          <Checkbox.Indicator>
                            <Check className="h-3 w-3" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        Videos
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-medium">Multi-file download</div>
                    <label className="mb-2 block text-sm">
                      Delay ms
                      <input
                        type="number"
                        min={250}
                        value={downloadDelayMs}
                        onChange={(event) => setDownloadDelayMs(Number(event.target.value))}
                        className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox.Root
                        checked={downloadRandom}
                        onCheckedChange={(checked) => setDownloadRandom(checked === true)}
                        className="flex h-4 w-4 items-center justify-center rounded border border-primary"
                      >
                        <Checkbox.Indicator>
                          <Check className="h-3 w-3" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      Random duration
                    </label>
                  </div>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files and folders..."
              className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm hover:bg-accent"
              >
                {currentFilterLabel}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                className="z-50 min-w-[180px] rounded-md border border-border bg-card p-1 shadow-md"
              >
                {FILTER_OPTIONS.map((option) => (
                  <DropdownMenu.Item
                    key={option.value}
                    className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                    onSelect={() => setFileTypeFilter(option.value)}
                  >
                    {option.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div className="inline-flex rounded-md border border-input">
            <button
              type="button"
              title="Grid view"
              onClick={() => setView('grid')}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-l-md',
                view === 'grid' ? 'bg-accent text-foreground' : 'hover:bg-accent/50',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="List view"
              onClick={() => setView('list')}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-r-md border-l border-input',
                view === 'list' ? 'bg-accent text-foreground' : 'hover:bg-accent/50',
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
