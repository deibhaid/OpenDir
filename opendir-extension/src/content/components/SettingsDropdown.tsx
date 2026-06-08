import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, Settings2 } from 'lucide-react';
import { useOpenDir } from '../context/OpenDirContext';
import type { ThemeMode } from '../types';
import { Button } from './ui/Button';

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
          className="z-50 rounded-lg border border-border bg-popover p-1 shadow-lg"
        >
          <div className="flex flex-row items-start gap-0">
            <div className="min-w-[7.5rem] py-1">
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-medium">Theme</DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <RadioGroup.Root
                value={theme}
                onValueChange={(value) => setTheme(value as ThemeMode)}
                className="px-2 py-1"
              >
                {(['light', 'dark', 'system'] as ThemeMode[]).map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 rounded-sm py-1.5 text-sm capitalize"
                  >
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

            <div className="min-w-[7.5rem] border-l border-border py-1 pl-1">
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-medium">Thumbnails</DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <div className="space-y-1 px-2 py-1">
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

            <div className="min-w-[9rem] border-l border-border py-1 pl-1">
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-medium">
                Multi-file download
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <div className="space-y-2 px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Delay (ms)</span>
                  <input
                    type="number"
                    min={250}
                    step={50}
                    value={downloadDelayMs}
                    onChange={(event) => setDownloadDelayMs(Number(event.target.value))}
                    className="h-8 w-[4.5rem] rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
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
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
