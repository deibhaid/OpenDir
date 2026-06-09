import { Download } from 'lucide-react';
import { useOpenDir } from '../context/OpenDirContext';
import { formatDate, formatSize } from '../parser/format';
import { getDisplayName } from '../lib/display';
import { getCategoryStyle } from '../lib/category';
import { ItemThumbnail } from './ItemThumbnail';
import { triggerDownload } from '../lib/files';
import { isPreviewableItem } from '../lib/preview';
import type { DirectoryItem } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

function GridCard({ item }: { item: DirectoryItem }) {
  const { thumbnails, setSelectedItem, extensionFilter, focusedHref } = useOpenDir();
  const style = getCategoryStyle(item);
  const isPreviewable = isPreviewableItem(item);
  const focused = focusedHref === item.href;

  const handleMediaClick = () => {
    if (item.type === 'directory') {
      window.open(item.href, '_self');
      return;
    }
    if (isPreviewable) {
      setSelectedItem(item);
      return;
    }
    window.open(item.href, '_self');
  };

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-background transition-all',
        'hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg',
        style.border,
        focused && 'ring-2 ring-primary/40',
      )}
    >
      <button
        type="button"
        onClick={handleMediaClick}
        className={cn('relative h-32 cursor-pointer p-4', style.bg)}
      >
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <ItemThumbnail
            item={item}
            thumbnails={thumbnails}
            extensionFilter={extensionFilter}
            className="h-full w-full transition-transform group-hover:scale-105"
            iconClassName={cn('h-12 w-12 transition-transform group-hover:scale-110', style.text)}
            showVideoPlayOverlay
          />
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-2 border-t p-4">
        <div className="flex items-start justify-between gap-2">
          <a
            href={item.href}
            className="min-w-0 flex-1 truncate font-medium hover:underline"
            title={getDisplayName(item)}
            onClick={(event) => {
              if (!isPreviewable) return;
              event.preventDefault();
              setSelectedItem(item);
            }}
          >
            {getDisplayName(item)}
          </a>
          {item.type === 'file' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
              title="Download"
              onClick={() => triggerDownload(item.href, item.name)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground/80">Size:</span>{' '}
            {item.type === 'directory'
              ? '-'
              : formatSize(item.size ?? item.sizeRaw) === '—'
                ? '-'
                : formatSize(item.size ?? item.sizeRaw)}
          </div>
          <div className="whitespace-nowrap">
            <span className="font-medium text-foreground/80">Modified:</span>{' '}
            {formatDate(item.modified ?? item.created) === '—'
              ? '-'
              : formatDate(item.modified ?? item.created)}
          </div>
          <div>
            <span className="font-medium text-foreground/80">Type:</span> {style.label}
          </div>
        </div>
      </div>
    </article>
  );
}

export function GridParentCard() {
  const { visibleItems } = useOpenDir();
  const parent = visibleItems.find((item) => item.isParent);
  if (!parent) return null;

  return (
    <div className="shrink-0 border-b border-border/80 bg-background p-4">
      <div className="max-w-[12rem]">
        <GridCard item={parent} />
      </div>
    </div>
  );
}

export function GridViewContent({ omitParent = false }: { omitParent?: boolean }) {
  const { visibleItems } = useOpenDir();
  const rows = omitParent ? visibleItems.filter((item) => !item.isParent) : visibleItems;

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {rows.map((item) => (
        <GridCard key={item.href} item={item} />
      ))}
    </div>
  );
}
