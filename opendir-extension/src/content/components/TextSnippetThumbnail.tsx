import { useEffect, useState } from 'react';
import { fetchTextPreview } from '../lib/preview';
import type { DirectoryItem } from '../types';
import { cn } from '../lib/utils';
import { FileTypeIcon } from './FileTypeIcon';

const SNIPPET_BYTES = 8192;
const SNIPPET_CHARS_COMPACT = 180;
const SNIPPET_CHARS_CARD = 480;

export type TextSnippetVariant = 'compact' | 'card';

interface TextSnippetThumbnailProps {
  item: DirectoryItem;
  className?: string;
  iconClassName?: string;
  variant?: TextSnippetVariant;
}

export function TextSnippetThumbnail({
  item,
  className,
  iconClassName,
  variant = 'card',
}: TextSnippetThumbnailProps) {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const isCompact = variant === 'compact';
  const maxChars = isCompact ? SNIPPET_CHARS_COMPACT : SNIPPET_CHARS_CARD;

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
      const raw = result.text.trim();
      setSnippet(raw.length > maxChars ? `${raw.slice(0, maxChars)}…` : raw);
    });

    return () => {
      cancelled = true;
    };
  }, [item.href, maxChars]);

  if (failed) {
    return (
      <span className={cn('flex items-center justify-center', className)}>
        <FileTypeIcon item={item} className={iconClassName ?? 'h-5 w-5'} />
      </span>
    );
  }

  if (snippet === null) {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col gap-1 overflow-hidden rounded border border-border/50 bg-muted/20 p-1.5',
          className,
        )}
        aria-hidden
      >
        <div className="h-1.5 w-full rounded bg-muted-foreground/20" />
        <div className="h-1.5 w-[85%] rounded bg-muted-foreground/15" />
        <div className="h-1.5 w-[70%] rounded bg-muted-foreground/10" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-full w-full overflow-hidden rounded border border-border/70 bg-background shadow-sm',
        isCompact ? 'p-0.5' : 'p-1.5',
        className,
      )}
      title={snippet}
    >
      <pre
        className={cn(
          'h-full w-full overflow-hidden text-left font-mono text-foreground whitespace-pre',
          isCompact ? 'text-[5px] leading-[1.05]' : 'text-[8px] leading-[1.15]',
        )}
      >
        {snippet || '(empty)'}
      </pre>
    </div>
  );
}
