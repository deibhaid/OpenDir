import { useOpenDir } from '../context/OpenDirContext';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

export function SelectionBar() {
  const { selectedHrefs, clearSelection, downloadSelected } = useOpenDir();

  const count = selectedHrefs.size;
  const hasSelection = count > 0;

  return (
    <div
      className={cn(
        'flex h-12 shrink-0 items-center gap-3 border-b px-4 py-2 text-sm',
        hasSelection && 'bg-muted/30',
      )}
    >
      {hasSelection && (
        <>
          <span>{count} selected</span>
          <Button size="sm" onClick={downloadSelected}>
            Download selected
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
