import {
  CODE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  PREVIEWABLE_FILE_TYPES,
  type DirectoryItem,
} from '../types';

/** Plain-text extensions that can be shown in the preview modal. */
export const TEXT_PREVIEW_EXTENSIONS = new Set([
  ...DOCUMENT_EXTENSIONS,
  ...CODE_EXTENSIONS,
  'nfo',
  'log',
  'xml',
  'json',
  'csv',
  'tsv',
  'ini',
  'cfg',
  'conf',
  'yml',
  'yaml',
  'srt',
  'sub',
  'ass',
  'vtt',
]);

export const MAX_TEXT_PREVIEW_BYTES = 512 * 1024;

export function isTextPreviewExtension(ext: string | undefined): boolean {
  if (!ext) return false;
  const lower = ext.toLowerCase();
  if (lower === 'pdf' || lower === 'doc' || lower === 'docx') return false;
  return TEXT_PREVIEW_EXTENSIONS.has(lower);
}

export function isTextPreviewItem(item: DirectoryItem): boolean {
  if (item.isParent || item.type !== 'file') return false;
  return isTextPreviewExtension(item.ext);
}

export function isPreviewableItem(item: DirectoryItem): boolean {
  if (item.isParent || item.type !== 'file') return false;
  if (item.fileType && PREVIEWABLE_FILE_TYPES.has(item.fileType)) return true;
  return isTextPreviewExtension(item.ext);
}

/** Strip markup and collapse whitespace for compact thumbnail snippets. */
export function formatTextSnippet(raw: string): string {
  const withoutTags = raw.replace(/<[^>]*>/g, ' ');
  const lines = withoutTags
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const collapsed = lines.join('\n').replace(/[ \t]{2,}/g, ' ').trim();
  return collapsed || raw.trim();
}

export async function fetchTextPreview(
  href: string,
  maxBytes = MAX_TEXT_PREVIEW_BYTES,
): Promise<{ text: string; truncated: boolean } | { error: string }> {
  try {
    const response = await fetch(href);
    if (!response.ok) {
      return { error: `Failed to load file (${response.status})` };
    }

    const buffer = await response.arrayBuffer();
    const truncated = buffer.byteLength > maxBytes;
    const bytes = truncated ? buffer.slice(0, maxBytes) : buffer;
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    if (text.includes('\0')) {
      return { error: 'File appears to be binary and cannot be previewed as text' };
    }

    return { text, truncated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load file';
    return { error: message };
  }
}
