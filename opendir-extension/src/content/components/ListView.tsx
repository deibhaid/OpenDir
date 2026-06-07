import { ArrowDown, ArrowUp } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOpenDir } from '../context/OpenDirContext';
import { formatDate, formatSize } from '../parser/format';
import { FileTypeIcon } from '../lib/files';
import type { SortColumn } from '../types';
import { cn } from '../lib/utils';

function SortIndicator({ column }: { column: SortColumn }) {
  const { sortColumn, sortDir } = useOpenDir();
  if (sortColumn !== column) return null;
  return sortDir === 'asc' ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />;
}

function SortableHeader({
  column,
  label,
  className,
}: {
  column: SortColumn;
  label: string;
  className?: string;
}) {
  const { toggleSort } = useOpenDir();
  return (
    <button
      type="button"
      onClick={() => toggleSort(column)}
      className={cn('inline-flex items-center font-medium hover:text-foreground', className)}
    >
      {label}
      <SortIndicator column={column} />
    </button>
  );
}

export function ListView() {
  const {
    visibleItems,
    filteredSortedItems,
    hasMore,
    loadMore,
    footerText,
    selectedHrefs,
    toggleSelected,
    allVisibleSelected,
    toggleSelectAllVisible,
    setSelectedItem,
    items,
  } = useOpenDir();

  if (items.length === 0) {
    return <EmptyState kind="empty" />;
  }

  if (filteredSortedItems.length === 0) {
    return <EmptyState kind="no-results" />;
  }

  return (
    <div id="scrollableDiv" className="min-h-0 flex-1 overflow-auto">
      <InfiniteScroll
        dataLength={visibleItems.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="py-4 text-center text-sm text-muted-foreground">Loading more…</div>}
        scrollableTarget="scrollableDiv"
      >
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-background/95 backdrop-blur">
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  aria-label="Select all visible"
                />
              </th>
              <th className="px-3 py-2"><SortableHeader column="name" label="Name" /></th>
              <th className="hidden px-3 py-2 md:table-cell"><SortableHeader column="ext" label="Extension" /></th>
              <th className="hidden px-3 py-2 lg:table-cell"><SortableHeader column="date" label="Date Created" /></th>
              <th className="px-3 py-2"><SortableHeader column="size" label="Size" className="justify-end w-full" /></th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item, index) => (
              <tr
                key={item.href}
                className={cn(
                  'border-b border-border/60 hover:bg-muted/40',
                  index % 2 === 1 && 'bg-muted/20',
                )}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedHrefs.has(item.href)}
                    onChange={() => toggleSelected(item.href)}
                    aria-label={`Select ${item.name}`}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileTypeIcon item={item} />
                    {item.type === 'directory' ? (
                      <a href={item.href} className="truncate hover:underline">{item.name}</a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="truncate text-left hover:underline"
                      >
                        {item.name}
                      </button>
                    )}
                  </div>
                </td>
                <td className="hidden px-3 py-2 md:table-cell">{item.ext ?? '—'}</td>
                <td className="hidden px-3 py-2 lg:table-cell">
                  {formatDate(item.created ?? item.modified)}
                </td>
                <td className="px-3 py-2 text-right">{formatSize(item.size ?? item.sizeRaw)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
      <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
        {footerText}
      </div>
    </div>
  );
}

function EmptyState({ kind }: { kind: 'empty' | 'no-results' }) {
  if (kind === 'empty') {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        This folder is empty
      </div>
    );
  }

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-muted-foreground">
      <div>No results found</div>
      <div className="text-sm">Try adjusting your search or filter.</div>
    </div>
  );
}

export function EmptyFolderState() {
  const { items, filteredSortedItems, search, fileTypeFilter } = useOpenDir();
  if (items.length === 0) return <EmptyState kind="empty" />;
  if (filteredSortedItems.length === 0 && (search || fileTypeFilter !== 'all')) {
    return <EmptyState kind="no-results" />;
  }
  return null;
}
