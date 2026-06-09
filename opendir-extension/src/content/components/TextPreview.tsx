import { useEffect, useState } from 'react';
import { fetchTextPreview, MAX_TEXT_PREVIEW_BYTES } from '../lib/preview';
import type { DirectoryItem } from '../types';

interface TextPreviewProps {
  item: DirectoryItem;
}

export function TextPreview({ item }: TextPreviewProps) {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'ready'; text: string; truncated: boolean } | { status: 'error'; message: string }
  >({ status: 'loading' });

  useEffect(() => {
    setState({ status: 'loading' });
    let cancelled = false;

    void fetchTextPreview(item.href).then((result) => {
      if (cancelled) return;
      if ('error' in result) {
        setState({ status: 'error', message: result.error });
        return;
      }
      setState({ status: 'ready', text: result.text, truncated: result.truncated });
    });

    return () => {
      cancelled = true;
    };
  }, [item.href]);

  if (state.status === 'loading') {
    return <div className="text-sm text-muted-foreground">Loading preview…</div>;
  }

  if (state.status === 'error') {
    return <div className="text-sm text-destructive">{state.message}</div>;
  }

  const limitLabel = `${Math.round(MAX_TEXT_PREVIEW_BYTES / 1024)} KB`;

  return (
    <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      {state.truncated && (
        <div className="border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          Preview truncated to the first {limitLabel} of the file.
        </div>
      )}
      <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 text-left text-sm leading-relaxed">
        {state.text || '(empty file)'}
      </pre>
    </div>
  );
}
