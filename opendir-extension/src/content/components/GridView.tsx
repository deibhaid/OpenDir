import { Download, Play } from 'lucide-react';
import { useOpenDir } from '../context/OpenDirContext';
import { formatDate, formatSize } from '../parser/format';
import { getDisplayName } from '../lib/display';
import { getCategoryStyle } from '../lib/category';
import { FileTypeIcon } from './FileTypeIcon';
import { triggerDownload } from '../lib/files';
import type { DirectoryItem } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

function GridCard({ item }: { item: DirectoryItem }) {
  const { thumbnails, setSelectedItem } = useOpenDir();
  const style = getCategoryStyle(item);
  const isPreviewable =
    item.fileType === 'image' || item.fileType === 'video' || item.fileType === 'audio';

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
      )}
    >
      <button
        type="button"
        onClick={handleMediaClick}
        className={cn('relative h-32 cursor-pointer p-4', style.bg)}
      >
        <span
          className={cn(
            'absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-medium',
            style.badge,
          )}
        >
          {style.label}
        </span>

        {item.fileType === 'image' && thumbnails.images ? (
          <img
            src={item.href}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : item.fileType === 'video' && thumbnails.videos ? (
          <div className="relative h-full w-full overflow-hidden">
            <video src={item.href} preload="metadata" muted className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Play className="h-10 w-10 text-white" />
            </span>
          </div>
        ) : item.fileType === 'video' ? (
          <div className="flex h-full items-center justify-center">
            <FileTypeIcon item={item} className="h-12 w-12 transition-transform group-hover:scale-110" />
            <Play className="absolute h-10 w-10 text-purple-600/80" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileTypeIcon
              item={item}
              className={cn('h-12 w-12 transition-transform group-hover:scale-110', style.text)}
            />
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 border-t p-4">
        <div className="flex items-start justify-between gap-2">
          <a href={item.href} className="min-w-0 flex-1 truncate font-medium hover:underline" title={getDisplayName(item)}>
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
        <div className="text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground/80">Size:</span>{' '}
            {formatSize(item.size ?? item.sizeRaw)}
          </div>
          <div>
            <span className="font-medium text-foreground/80">Modified:</span>{' '}
            {formatDate(item.modified ?? item.created)}
          </div>
        </div>
      </div>
    </article>
  );
}

export function GridViewContent() {
  const { visibleItems } = useOpenDir();

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {visibleItems.map((item) => (
        <GridCard key={item.href} item={item} />
      ))}
    </div>
  );
}
