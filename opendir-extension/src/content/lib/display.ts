import type { DirectoryItem } from '../types';
import { safeDecodeURIComponent } from './url';

export function getCurrentDirectoryLabel(url: string = window.location.href): string {
  const parsed = new URL(url);
  let pathname = parsed.pathname;
  if (pathname.endsWith('/') && pathname.length > 1) {
    pathname = pathname.slice(0, -1);
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    if (parsed.protocol === 'file:') {
      return parsed.href.replace(/\/?$/, '');
    }
    return parsed.hostname;
  }

  return safeDecodeURIComponent(segments[segments.length - 1]);
}

export function getOpenDirTabTitle(url?: string): string {
  return `OD: ${getCurrentDirectoryLabel(url)}`;
}

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
