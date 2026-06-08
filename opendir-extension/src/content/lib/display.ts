import type { DirectoryItem } from '../types';

/** Display name without redundant extension when a separate Extension column exists. */
export function getDisplayName(item: DirectoryItem): string {
  if (item.isParent || item.type === 'directory') {
    return item.name;
  }

  if (!item.ext) {
    return item.name;
  }

  const suffix = `.${item.ext}`;
  if (item.name.toLowerCase().endsWith(suffix.toLowerCase())) {
    return item.name.slice(0, -suffix.length);
  }

  return item.name;
}
