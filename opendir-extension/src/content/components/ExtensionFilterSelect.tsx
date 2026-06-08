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
        'h-full min-w-[5.25rem] max-w-[7rem] shrink-0 cursor-pointer appearance-none border-0 bg-transparent',
        'px-2.5 text-sm font-medium leading-10 text-foreground',
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
