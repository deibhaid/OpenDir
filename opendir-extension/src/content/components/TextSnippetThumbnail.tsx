import { useEffect, useState } from 'react';
import { fetchTextPreview } from '../lib/preview';
import type { DirectoryItem } from '../types';
import { cn } from '../lib/utils';
import { FileTypeIcon } from './FileTypeIcon';

const SNIPPET_BYTES = 4096;
const SNIPPET_CHARS = 320;

interface TextSnippetThumbnailProps {
  item: DirectoryItem;
  className?: string;
  iconClassName?: string;
}

export function TextSnippetThumbnail({
  item,
  className,
  iconClassName,
}: TextSnippetThumbnailProps) {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSnippet(null);
    setFailed(false);
    let cancelled = false;

    void fetchTextPreview(item.href, SNIPPET_BYTES).then((result) => {
      if (cancelled) return;
      if ('error' in result) {
        setFailed(true);
        return;
      }
      const trimmed = result.text.trim();
      setSnippet(trimmed.length > SNIPPET_CHARS ? `${trimmed.slice(0, SNIPPET_CHARS)}…` : trimmed);
    });

    return () => {
      cancelled = true;
    };
  }, [item.href]);

  if (failed) {
    return (
      <span className={cn('flex items-center justify-center', className)}>
        <FileTypeIcon item={item} className={iconClassName ?? 'h-5 w-5'} />
      </span>
    );
  }

  if (snippet === null) {
    return (
      <span
        className={cn(
          'flex items-center justify-center rounded border border-border/50 bg-muted/20 text-[10px] text-muted-foreground',
          className,
        )}
      >
        …
      </span>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded border border-border/60 bg-background/90 p-1.5 shadow-sm',
        className,
      )}
      title={snippet}
    >
      <pre className="line-clamp-[8] whitespace-pre-wrap break-words text-left text-[9px] leading-snug text-muted-foreground">
        {snippet || '(empty)'}
      </pre>
    </div>
  );
}
