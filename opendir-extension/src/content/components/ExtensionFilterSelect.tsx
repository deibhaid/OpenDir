import { useMemo } from 'react';
import { useOpenDir } from '../context/OpenDirContext';
import { ALL_EXTENSIONS_FILTER } from '../types';
import { cn } from '../lib/utils';

const MIN_FILTER_FIELD_CHARS = 7;

export function ExtensionFilterSelect({ className }: { className?: string }) {
  const { extensionFilter, setExtensionFilter, directoryExtensions } = useOpenDir();

  const fieldWidth = useMemo(() => {
    const chars = Math.max(extensionFilter.length, MIN_FILTER_FIELD_CHARS);
    return `${Math.min(chars + 0.5, 12)}ch`;
  }, [extensionFilter]);

  return (
    <select
      value={extensionFilter}
      onChange={(event) => setExtensionFilter(event.target.value)}
      aria-label="Filter by extension"
      title="Filter by extension"
      style={{ width: fieldWidth }}
      className={cn(
        'h-full max-w-[4.5rem] shrink-0 cursor-pointer appearance-none border-0 bg-transparent',
        'px-1 text-sm font-medium leading-10 text-foreground',
        'focus-visible:outline-none focus-visible:ring-0',
        className,
      )}
    >
      <option value={ALL_EXTENSIONS_FILTER}>{ALL_EXTENSIONS_FILTER}</option>
      {directoryExtensions.map((ext) => (
        <option key={ext} value={`*.${ext}`}>
          *.{ext}
        </option>
      ))}
    </select>
  );
}
