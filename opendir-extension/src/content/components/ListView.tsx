import { useRef } from 'react';
import { ItemThumbnail } from './ItemThumbnail';
import { useOpenDir } from '../context/OpenDirContext';
import { getDisplayName } from '../lib/display';
import { isPreviewableItem } from '../lib/preview';
import { formatDate, formatSize } from '../parser/format';
import type { SortColumn } from '../types';
import { cn } from '../lib/utils';

function SortGlyph({ column }: { column: SortColumn }) {
  const { sortColumn, sortDir } = useOpenDir();
  if (sortColumn !== column) return null;

  const inverted = column === 'name';
  const ascGlyph = inverted ? '▼' : '▲';
  const descGlyph = inverted ? '▲' : '▼';
  return (
    <span className="text-[10px] leading-none text-muted-foreground">
      {sortDir === 'asc' ? ascGlyph : descGlyph}
    </span>
  );
}

function SortableHeader({
  column,
  label,
  align = 'left',
}: {
  column: SortColumn;
  label: string;
  align?: 'left' | 'right';
}) {
  const { sortColumn, toggleSort } = useOpenDir();
  const active = sortColumn === column;

  return (
    <button
      type="button"
      onClick={() => toggleSort(column)}
      className={cn(
        'flex cursor-pointer select-none items-center gap-1 text-xs font-medium',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        align === 'right' && 'ml-auto w-full justify-end text-right',
      )}
    >
      {label}
      <SortGlyph column={column} />
    </button>
  );
}

function ListColumns() {
  return (
    <colgroup>
      <col className="w-10" />
      <col />
      <col className="w-[100px]" />
      <col className="w-[180px]" />
      <col className="w-[100px]" />
    </colgroup>
  );
}

export function ListViewHeader() {
  const { allVisibleSelected, toggleSelectAllVisible } = useOpenDir();

  return (
    <div className="shrink-0 border-b border-border/80 bg-background px-1">
      <table className="w-full table-fixed text-sm">
        <ListColumns />
        <thead>
          <tr>
            <th className="px-4 py-3">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                aria-label="Select all visible"
                className="h-4 w-4 rounded border-border"
              />
            </th>
            <th className="px-4 py-3 text-left">
              <SortableHeader column="name" label="Name" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortableHeader column="ext" label="Extension" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortableHeader column="date" label="Date Created" />
            </th>
            <th className="px-4 py-3">
              <SortableHeader column="size" label="Size" align="right" />
            </th>
          </tr>
        </thead>
      </table>
    </div>
  );
}

function ListRow({ item }: { item: import('../types').DirectoryItem }) {
  const { selectedHrefs, selectItem, setSelectedItem, thumbnails } = useOpenDir();
  const opensPreview = isPreviewableItem(item);
  const selected = selectedHrefs.has(item.href);
  const displayName = getDisplayName(item);
  const shiftClickRef = useRef(false);

  return (
    <tr
      className={cn(
        'border-b border-border/70 transition-colors hover:bg-muted/30',
        selected && 'bg-primary/5',
      )}
    >
      <td className="px-4 py-3">
        {!item.isParent && (
          <input
            type="checkbox"
            checked={selected}
            onMouseDown={(event) => {
              shiftClickRef.current = event.shiftKey;
            }}
            onChange={() => {
              selectItem(item.href, { shiftKey: shiftClickRef.current });
            }}
            aria-label={`Select ${displayName}`}
            className="h-4 w-4 cursor-pointer rounded border-border"
          />
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <button
            type="button"
            className={cn(
              'mt-0.5 shrink-0 rounded',
              opensPreview ? 'cursor-pointer hover:opacity-90' : 'cursor-default',
            )}
            disabled={!opensPreview}
            onClick={() => {
              if (opensPreview) setSelectedItem(item);
            }}
            aria-label={opensPreview ? `Preview ${displayName}` : undefined}
          >
            <ItemThumbnail
              item={item}
              thumbnails={thumbnails}
              className="h-10 w-10"
              iconClassName="h-5 w-5"
              showVideoPlayOverlay
            />
          </button>
          <a
            href={item.href}
            className="min-w-0 flex-1 break-words text-foreground hover:underline"
            title={displayName}
            onClick={(event) => {
              if (!opensPreview) return;
              event.preventDefault();
              setSelectedItem(item);
            }}
          >
            {displayName}
          </a>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {item.type === 'directory' ? '-' : item.ext ?? '-'}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(item.created ?? item.modified) === '—'
          ? '-'
          : formatDate(item.created ?? item.modified)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
        {item.type === 'directory'
          ? '-'
          : formatSize(item.size ?? item.sizeRaw) === '—'
            ? '-'
            : formatSize(item.size ?? item.sizeRaw)}
      </td>
    </tr>
  );
}

export function ListViewBody() {
  const { visibleItems } = useOpenDir();

  return (
    <table className="w-full table-fixed text-sm">
      <ListColumns />
      <tbody>
        {visibleItems.map((item) => (
          <ListRow key={item.href} item={item} />
        ))}
      </tbody>
    </table>
  );
}

/** @deprecated Use ListViewHeader + ListViewBody in FileBrowser */
export function ListViewContent() {
  return (
    <>
      <ListViewHeader />
      <ListViewBody />
    </>
  );
}
