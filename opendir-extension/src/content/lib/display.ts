import type { DirectoryItem } from '../types';

/** Display name without redundant extension when a separate Extension column exists. */
export function getDisplayName(item: DirectoryItem): string {
  const prefix = item.relativePath ?? '';

  if (item.isParent || item.type === 'directory') {
    return `${prefix}${item.name}`;
  }

  if (!item.ext) {
    return `${prefix}${item.name}`;
  }

  const suffix = `.${item.ext}`;
  if (item.name.toLowerCase().endsWith(suffix.toLowerCase())) {
    return `${prefix}${item.name.slice(0, -suffix.length)}`;
  }

  return `${prefix}${item.name}`;
}
