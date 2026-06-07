import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useMemo } from 'react';
import { useOpenDir } from '../context/OpenDirContext';
import { getPreviewableItems } from '../context/settings';
import { triggerDownload, FileTypeIcon } from '../lib/files';
import { formatSize } from '../parser/format';

export function PreviewModal() {
  const { selectedItem, setSelectedItem, filteredSortedItems } = useOpenDir();

  const previewableItems = useMemo(
    () => getPreviewableItems(filteredSortedItems),
    [filteredSortedItems],
  );

  const currentIndex = selectedItem
    ? previewableItems.findIndex((item) => item.href === selectedItem.href)
    : -1;

  const hasNavigation = previewableItems.length > 1 && currentIndex >= 0;

  const goTo = (offset: number) => {
    if (currentIndex < 0) return;
    const nextIndex = (currentIndex + offset + previewableItems.length) % previewableItems.length;
    setSelectedItem(previewableItems[nextIndex]);
  };

  return (
    <Dialog.Root open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          {selectedItem && (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <Dialog.Title className="truncate text-lg font-semibold">{selectedItem.name}</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                    {selectedItem.ext && (
                      <span className="mr-2 rounded bg-muted px-2 py-0.5 text-xs uppercase">{selectedItem.ext}</span>
                    )}
                    <span>{formatSize(selectedItem.size ?? selectedItem.sizeRaw)}</span>
                    {hasNavigation && (
                      <span className="ml-2">{currentIndex + 1} of {previewableItems.length}</span>
                    )}
                  </Dialog.Description>
                </div>
                <div className="flex items-center gap-2">
                  {hasNavigation && (
                    <>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent"
                        onClick={() => goTo(-1)}
                        aria-label="Previous item"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent"
                        onClick={() => goTo(1)}
                        aria-label="Next item"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-input px-2 text-sm hover:bg-accent"
                    onClick={() => triggerDownload(selectedItem.href, selectedItem.name)}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent"
                      aria-label="Close preview"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              <div className="flex min-h-[320px] flex-1 items-center justify-center bg-muted/20 p-4">
                {selectedItem.fileType === 'image' && (
                  <img
                    src={selectedItem.href}
                    alt={selectedItem.name}
                    className="max-h-[60vh] max-w-full object-contain"
                  />
                )}
                {selectedItem.fileType === 'video' && (
                  <video
                    src={selectedItem.href}
                    controls
                    autoPlay
                    className="max-h-[60vh] max-w-full"
                  />
                )}
                {selectedItem.fileType === 'audio' && (
                  <div className="flex w-full max-w-xl flex-col items-center gap-4">
                    <FileTypeIcon item={selectedItem} className="h-16 w-16" />
                    <audio src={selectedItem.href} controls autoPlay className="w-full" />
                  </div>
                )}
                {selectedItem.fileType !== 'image' &&
                  selectedItem.fileType !== 'video' &&
                  selectedItem.fileType !== 'audio' && (
                    <FileTypeIcon item={selectedItem} className="h-24 w-24" />
                  )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
