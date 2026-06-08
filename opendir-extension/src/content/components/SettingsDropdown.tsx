import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, Settings2 } from 'lucide-react';
import { useOpenDir } from '../context/OpenDirContext';
import type { ThemeMode } from '../types';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function SettingsDropdown() {
  const {
    theme,
    setTheme,
    thumbnails,
    setThumbnails,
    downloadDelayMs,
    setDownloadDelayMs,
    downloadRandom,
    setDownloadRandom,
  } = useOpenDir();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="icon" title="Settings" aria-label="Settings">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-0 rounded-lg border border-border bg-popover p-1 shadow-lg"
        >
          <div className="flex flex-row items-start gap-0 p-1">
            {/* Column 1 — Theme */}
            <div className="min-w-[7.5rem] py-1">
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
                Theme
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.RadioGroup value={theme} onValueChange={(value) => setTheme(value as ThemeMode)}>
                {THEME_OPTIONS.map((option) => (
                  <DropdownMenu.RadioItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                      'focus:bg-accent data-[highlighted]:bg-accent',
                    )}
                    onSelect={(event) => event.preventDefault()}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <DropdownMenu.ItemIndicator>
                        <Check className="h-3.5 w-3.5" />
                      </DropdownMenu.ItemIndicator>
                    </span>
                    {option.label}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </div>

            {/* Column 2 — Thumbnails */}
            <div className="min-w-[7.5rem] border-l border-border py-1 pl-1">
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
                Thumbnails
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.CheckboxItem
                checked={thumbnails.images}
                onCheckedChange={(checked) =>
                  setThumbnails({ ...thumbnails, images: checked === true })
                }
                className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent data-[highlighted]:bg-accent"
                onSelect={(event) => event.preventDefault()}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <DropdownMenu.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </DropdownMenu.ItemIndicator>
                </span>
                Images
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.CheckboxItem
                checked={thumbnails.videos}
                onCheckedChange={(checked) =>
                  setThumbnails({ ...thumbnails, videos: checked === true })
                }
                className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent data-[highlighted]:bg-accent"
                onSelect={(event) => event.preventDefault()}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <DropdownMenu.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </DropdownMenu.ItemIndicator>
                </span>
                Videos
              </DropdownMenu.CheckboxItem>
            </div>

            {/* Column 3 — Multi-file download */}
            <div className="min-w-[9rem] border-l border-border py-1 pl-1">
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
                Multi-file download
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <div className="space-y-2 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="whitespace-nowrap text-xs text-muted-foreground">Delay (ms)</span>
                  <input
                    type="number"
                    min={250}
                    step={50}
                    value={downloadDelayMs}
                    onChange={(event) =>
                      setDownloadDelayMs(Math.max(250, parseInt(event.target.value, 10) || 250))
                    }
                    className="h-8 w-[4.5rem] rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                <DropdownMenu.CheckboxItem
                  checked={downloadRandom}
                  onCheckedChange={(checked) => setDownloadRandom(checked === true)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent data-[highlighted]:bg-accent"
                  onSelect={(event) => event.preventDefault()}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <DropdownMenu.ItemIndicator>
                      <Check className="h-3.5 w-3.5" />
                    </DropdownMenu.ItemIndicator>
                  </span>
                  Random duration
                </DropdownMenu.CheckboxItem>
              </div>
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
