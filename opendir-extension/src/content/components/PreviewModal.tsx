import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useOpenDir } from '../context/OpenDirContext';
import { getPreviewableItems } from '../context/settings';
import { triggerDownload, FileTypeIcon } from '../lib/files';
import { formatSize } from '../parser/format';
import { Button } from './ui/Button';
import { PREVIEWABLE_FILE_TYPES } from '../types';

export function PreviewModal() {
  const { selectedItem, setSelectedItem, filteredSortedItems } = useOpenDir();

  const previewableItems = useMemo(
    () => getPreviewableItems(filteredSortedItems),
    [filteredSortedItems],
  );

  const isPreviewable =
    !!selectedItem &&
    !!selectedItem.fileType &&
    PREVIEWABLE_FILE_TYPES.has(selectedItem.fileType);

  const currentIndex =
    selectedItem && isPreviewable
      ? previewableItems.findIndex((item) => item.href === selectedItem.href)
      : -1;

  const hasNavigation = previewableItems.length > 1 && currentIndex >= 0;

  const goTo = (offset: number) => {
    if (currentIndex < 0) return;
    const nextIndex = (currentIndex + offset + previewableItems.length) % previewableItems.length;
    setSelectedItem(previewableItems[nextIndex]);
  };

  useEffect(() => {
    if (!isPreviewable) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedItem(null);
      if (event.key === 'ArrowLeft') goTo(-1);
      if (event.key === 'ArrowRight') goTo(1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPreviewable, currentIndex, previewableItems, setSelectedItem]);

  return (
    <Dialog.Root open={isPreviewable} onOpenChange={(open) => !open && setSelectedItem(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[85vh] w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background p-0 shadow-2xl">
          {selectedItem && isPreviewable && (
            <>
              <div className="border-b p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Dialog.Title className="truncate text-lg font-semibold">
                      {selectedItem.name}
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {selectedItem.ext && (
                        <span className="rounded bg-muted px-2 py-0.5 text-xs uppercase">
                          {selectedItem.ext}
                        </span>
                      )}
                      <span>{formatSize(selectedItem.size ?? selectedItem.sizeRaw)}</span>
                      {hasNavigation && (
                        <span>
                          {currentIndex + 1} of {previewableItems.length}
                        </span>
                      )}
                    </Dialog.Description>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Download"
                      onClick={() => triggerDownload(selectedItem.href, selectedItem.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Dialog.Close asChild>
                      <Button variant="outline" size="icon" title="Close" aria-label="Close preview">
                        <X className="h-4 w-4" />
                      </Button>
                    </Dialog.Close>
                  </div>
                </div>
              </div>

              <div className="relative flex flex-1 items-center justify-center overflow-auto bg-muted/20 p-6">
                {hasNavigation && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full"
                      onClick={() => goTo(-1)}
                      aria-label="Previous item"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full"
                      onClick={() => goTo(1)}
                      aria-label="Next item"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {selectedItem.fileType === 'image' && (
                  <img
                    src={selectedItem.href}
                    alt={selectedItem.name}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                  />
                )}
                {selectedItem.fileType === 'video' && (
                  <video
                    src={selectedItem.href}
                    controls
                    autoPlay
                    className="max-h-full max-w-full rounded-lg"
                  />
                )}
                {selectedItem.fileType === 'audio' && (
                  <div className="w-full max-w-lg rounded-lg border border-border bg-background p-8 text-center shadow-lg">
                    <div className="mb-4 text-5xl">🎵</div>
                    <FileTypeIcon item={selectedItem} className="mx-auto mb-3 h-10 w-10" />
                    <div className="mb-1 font-medium">{selectedItem.name}</div>
                    <div className="mb-4 text-sm text-muted-foreground">
                      {formatSize(selectedItem.size ?? selectedItem.sizeRaw)}
                    </div>
                    <audio src={selectedItem.href} controls autoPlay className="w-full" />
                  </div>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
