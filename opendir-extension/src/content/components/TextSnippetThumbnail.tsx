import { useEffect, useState } from 'react';
import { fetchTextPreview, formatTextSnippet } from '../lib/preview';
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
      const formatted = formatTextSnippet(result.text);
      setSnippet(
        formatted.length > maxChars ? `${formatted.slice(0, maxChars)}…` : formatted,
      );
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
        'flex h-full w-full flex-col overflow-hidden rounded border border-border/70 bg-card shadow-sm',
        isCompact ? 'p-1' : 'p-2',
        className,
      )}
      title={snippet}
    >
      <pre
        className={cn(
          'flex-1 overflow-hidden whitespace-pre-wrap break-words text-left font-mono text-foreground/80',
          isCompact
            ? 'line-clamp-4 text-[7px] leading-[1.15]'
            : 'line-clamp-[10] text-[10px] leading-snug',
        )}
      >
        {snippet || '(empty)'}
      </pre>
    </div>
  );
}
