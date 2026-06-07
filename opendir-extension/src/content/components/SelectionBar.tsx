import { useOpenDir } from '../context/OpenDirContext';
import { downloadSelectedFiles } from '../lib/files';

export function SelectionBar() {
  const {
    selectedHrefs,
    clearSelection,
    filteredSortedItems,
    downloadDelayMs,
    downloadRandom,
  } = useOpenDir();

  const count = selectedHrefs.size;
  const visible = count > 0;

  return (
    <div className="h-12 shrink-0 border-b border-border/60 bg-muted/30">
      {visible && (
        <div className="flex h-full items-center gap-3 px-4">
          <span className="text-sm font-medium">{count} selected</span>
          <button
            type="button"
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
            onClick={() => {
              void downloadSelectedFiles(filteredSortedItems, selectedHrefs, downloadDelayMs, downloadRandom);
            }}
          >
            Download selected
          </button>
          <button
            type="button"
            className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
            onClick={clearSelection}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
