import InfiniteScroll from 'react-infinite-scroll-component';
import { useOpenDir } from '../context/OpenDirContext';
import { formatDate, formatSize } from '../parser/format';
import { FileTypeIcon } from '../lib/files';
import { cn } from '../lib/utils';

export function GridView() {
  const {
    visibleItems,
    filteredSortedItems,
    hasMore,
    loadMore,
    footerText,
    thumbnails,
    setSelectedItem,
    items,
  } = useOpenDir();

  if (items.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        This folder is empty
      </div>
    );
  }

  if (filteredSortedItems.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-muted-foreground">
        <div>No results found</div>
        <div className="text-sm">Try adjusting your search or filter.</div>
      </div>
    );
  }

  return (
    <div id="scrollableDiv" className="min-h-0 flex-1 overflow-auto px-4 py-4">
      <InfiniteScroll
        dataLength={visibleItems.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="py-4 text-center text-sm text-muted-foreground">Loading more…</div>}
        scrollableTarget="scrollableDiv"
      >
        <div className="opendir-grid">
          {visibleItems.map((item) => (
            <article
              key={item.href}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <button
                type="button"
                onClick={() => item.type === 'file' && setSelectedItem(item)}
                className={cn(
                  'flex h-36 w-full items-center justify-center bg-muted/40',
                  item.type === 'directory' && 'cursor-default',
                )}
              >
                {item.type === 'directory' ? (
                  <FileTypeIcon item={item} className="h-12 w-12" />
                ) : thumbnails.images && item.fileType === 'image' ? (
                  <img
                    src={item.href}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : thumbnails.videos && item.fileType === 'video' ? (
                  <video
                    src={item.href}
                    preload="metadata"
                    muted
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileTypeIcon item={item} className="h-12 w-12" />
                )}
              </button>
              <div className="space-y-1 p-3 text-sm">
                {item.type === 'directory' ? (
                  <a href={item.href} className="block truncate font-medium hover:underline">{item.name}</a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="block w-full truncate text-left font-medium hover:underline"
                  >
                    {item.name}
                  </button>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.ext ?? '—'}</span>
                  <span>{formatSize(item.size ?? item.sizeRaw)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(item.modified ?? item.created)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </InfiniteScroll>
      <div className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
        {footerText}
      </div>
    </div>
  );
}
