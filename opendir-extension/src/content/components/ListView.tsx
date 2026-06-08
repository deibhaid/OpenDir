import { useOpenDir } from '../context/OpenDirContext';
import { formatDate, formatSize } from '../parser/format';
import { FileTypeIcon } from '../lib/files';
import type { DirectoryItem, SortColumn } from '../types';
import { cn } from '../lib/utils';

function SortGlyph({ column }: { column: SortColumn }) {
  const { sortColumn, sortDir } = useOpenDir();
  if (sortColumn !== column) return null;

  const inverted = column === 'name';
  const ascGlyph = inverted ? '▼' : '▲';
  const descGlyph = inverted ? '▲' : '▼';
  return (
    <span className="text-[10px] leading-none">{sortDir === 'asc' ? ascGlyph : descGlyph}</span>
  );
}

function SortableHeader({
  column,
  label,
  className,
  align = 'left',
}: {
  column: SortColumn;
  label: string;
  className?: string;
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
        className,
      )}
    >
      {label}
      <SortGlyph column={column} />
    </button>
  );
}

function ListRow({
  item,
  index,
}: {
  item: DirectoryItem;
  index: number;
}) {
  const { selectedHrefs, toggleSelected } = useOpenDir();
  const selected = selectedHrefs.has(item.href);

  return (
    <tr
      className={cn(
        'border-b border-border/60 hover:bg-muted/50',
        index % 2 === 1 ? 'bg-muted/20' : 'bg-background',
        selected && 'bg-primary/10',
      )}
    >
      <td className="w-8 px-3 py-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleSelected(item.href)}
          aria-label={`Select ${item.name}`}
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileTypeIcon item={item} />
          <a href={item.href} className="truncate hover:underline" title={item.name}>
            {item.name}
          </a>
        </div>
      </td>
      <td className="w-[100px] px-3 py-2">
        {item.type === 'directory' ? '-' : item.ext ?? '-'}
      </td>
      <td className="w-[180px] px-3 py-2">
        {formatDate(item.created ?? item.modified) === '—'
          ? '-'
          : formatDate(item.created ?? item.modified)}
      </td>
      <td className="w-[90px] px-3 py-2 text-right tabular-nums">
        {item.type === 'directory'
          ? '-'
          : formatSize(item.size ?? item.sizeRaw) === '—'
            ? '-'
            : formatSize(item.size ?? item.sizeRaw)}
      </td>
    </tr>
  );
}

export function ListViewContent() {
  const { visibleItems, allVisibleSelected, toggleSelectAllVisible } = useOpenDir();

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <tr>
          <th className="w-8 px-3 py-2">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              aria-label="Select all visible"
            />
          </th>
          <th className="px-3 py-2 text-left">
            <SortableHeader column="name" label="Name" />
          </th>
          <th className="w-[100px] px-3 py-2 text-left">
            <SortableHeader column="ext" label="Extension" />
          </th>
          <th className="w-[180px] px-3 py-2 text-left">
            <SortableHeader column="date" label="Date Created" />
          </th>
          <th className="w-[90px] px-3 py-2">
            <SortableHeader column="size" label="Size" align="right" />
          </th>
        </tr>
      </thead>
      <tbody>
        {visibleItems.map((item, index) => (
          <ListRow key={item.href} item={item} index={index} />
        ))}
      </tbody>
    </table>
  );
}
