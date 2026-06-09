import { describe, expect, it } from 'vitest';
import type { DirectoryItem } from '../src/content/types';
import {
  fetchTextPreview,
  formatTextSnippet,
  isPreviewableItem,
  isTextPreviewExtension,
} from '../src/content/lib/preview';

function fileItem(ext: string, fileType?: DirectoryItem['fileType']): DirectoryItem {
  return {
    name: `example.${ext}`,
    href: `https://example.com/example.${ext}`,
    type: 'file',
    ext,
    fileType,
  };
}

describe('text preview helpers', () => {
  it('treats common text and metadata extensions as previewable', () => {
    expect(isTextPreviewExtension('nfo')).toBe(true);
    expect(isTextPreviewExtension('txt')).toBe(true);
    expect(isTextPreviewExtension('md')).toBe(true);
    expect(isTextPreviewExtension('json')).toBe(true);
    expect(isTextPreviewExtension('pdf')).toBe(false);
  });

  it('includes text documents in previewable items', () => {
    expect(isPreviewableItem(fileItem('nfo', 'default'))).toBe(true);
    expect(isPreviewableItem(fileItem('txt', 'document'))).toBe(true);
    expect(isPreviewableItem(fileItem('js', 'code'))).toBe(true);
    expect(isPreviewableItem(fileItem('mkv', 'video'))).toBe(true);
    expect(isPreviewableItem(fileItem('pdf', 'document'))).toBe(false);
  });
});

describe('formatTextSnippet', () => {
  it('strips tags and blank lines from nfo-style content', () => {
    const raw = `<movie>
<title>Example</title>
<plot>A survivor story.</plot>
</movie>`;
    expect(formatTextSnippet(raw)).toBe('Example\nA survivor story.');
  });
});

describe('fetchTextPreview', () => {
  it('loads text content from a URL', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response('title=Example Movie\nplot=Test', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });

    await expect(fetchTextPreview('https://example.com/movie.nfo')).resolves.toEqual({
      text: 'title=Example Movie\nplot=Test',
      truncated: false,
    });

    globalThis.fetch = originalFetch;
  });

  it('reports binary files as non-previewable', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(new Uint8Array([0, 1, 2, 0, 4]), {
        status: 200,
      });

    await expect(fetchTextPreview('https://example.com/binary.bin')).resolves.toEqual({
      error: 'File appears to be binary and cannot be previewed as text',
    });

    globalThis.fetch = originalFetch;
  });
});
