import {
  ALL_EXTENSIONS_FILTER,
  IMAGE_EXTENSIONS,
  type DirectoryItem,
  type ThumbnailSettings,
} from '../types';

export const DIRECTORY_COVER_FILES = [
  'fanart.jpg',
  'poster.jpg',
  'backdrop.jpg',
  'folder.jpg',
] as const;

export function normalizeDirectoryHref(href: string): string {
  return href.endsWith('/') ? href : `${href}/`;
}

export function extensionFilterMatchesItem(
  extensionFilter: string,
  item: DirectoryItem,
): boolean {
  if (extensionFilter === ALL_EXTENSIONS_FILTER) return false;
  if (item.type === 'directory' || !item.ext) return false;
  const normalized = extensionFilter.startsWith('*.')
    ? extensionFilter.slice(2).toLowerCase()
    : extensionFilter.toLowerCase();
  return item.ext.toLowerCase() === normalized;
}

export function isImageExtensionFilter(extensionFilter: string): boolean {
  if (extensionFilter === ALL_EXTENSIONS_FILTER) return false;
  const normalized = extensionFilter.startsWith('*.')
    ? extensionFilter.slice(2).toLowerCase()
    : extensionFilter.toLowerCase();
  return IMAGE_EXTENSIONS.has(normalized);
}

/** Show actual image thumbnails for files (not just the generic image icon). */
export function shouldShowImageThumbnail(
  item: DirectoryItem,
  thumbnails: ThumbnailSettings,
  extensionFilter: string = ALL_EXTENSIONS_FILTER,
): boolean {
  if (!thumbnails.enabled || item.fileType !== 'image') return false;
  if (thumbnails.images) return true;
  return extensionFilterMatchesItem(extensionFilter, item);
}

/** Try fanart/poster images as thumbnails for folder rows. */
export function shouldShowDirectoryCover(thumbnails: ThumbnailSettings): boolean {
  return thumbnails.enabled && thumbnails.images;
}
