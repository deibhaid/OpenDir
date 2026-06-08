import { FolderOpen, SearchX } from 'lucide-react';
import { useOpenDir } from '../context/OpenDirContext';

export function EmptyState() {
  const { search, hasActiveFilter } = useOpenDir();

  if (hasActiveFilter) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <SearchX className="mx-auto mb-4 h-16 w-16 text-muted-foreground/60" />
          <h3 className="mb-2 text-lg font-semibold">No results found</h3>
          <p className="text-sm text-muted-foreground">
            {search
              ? `No files or folders match "${search}". Try a different search term.`
              : 'No files or folders match the current filter. Try adjusting your filter.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <FolderOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground/60" />
        <h3 className="mb-2 text-lg font-semibold">This folder is empty</h3>
        <p className="text-sm text-muted-foreground">
          There are no files or folders in this directory.
        </p>
      </div>
    </div>
  );
}

export function ListSkeletonRows() {
  return (
    <div className="space-y-2 px-4 py-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded bg-muted/40" />
      ))}
    </div>
  );
}

export function GridSkeletonCards() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-border">
          <div className="h-32 animate-pulse bg-muted/40" />
          <div className="space-y-2 p-4">
            <div className="h-4 animate-pulse rounded bg-muted/40" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
