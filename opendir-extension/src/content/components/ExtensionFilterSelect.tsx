import { useOpenDir } from '../context/OpenDirContext';
import { ALL_EXTENSIONS_FILTER } from '../types';
import { cn } from '../lib/utils';

export function ExtensionFilterSelect({ className }: { className?: string }) {
  const { extensionFilter, setExtensionFilter, directoryExtensions } = useOpenDir();

  return (
    <select
      value={extensionFilter}
      onChange={(event) => setExtensionFilter(event.target.value)}
      aria-label="Filter by extension"
      title="Filter by extension"
      className={cn(
        'h-10 shrink-0 cursor-pointer border-0 bg-transparent px-2 text-sm text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
        className,
      )}
    >
      <option value={ALL_EXTENSIONS_FILTER}>{ALL_EXTENSIONS_FILTER}</option>
      {directoryExtensions.map((ext) => (
        <option key={ext} value={`.${ext}`}>
          .{ext}
        </option>
      ))}
    </select>
  );
}
