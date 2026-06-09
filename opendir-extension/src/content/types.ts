export type ItemType = 'file' | 'directory';

export type FileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'archive'
  | 'default';

/** Extension filter value; `*.*` matches all items. */
export type ExtensionFilter = string;

export const ALL_EXTENSIONS_FILTER = '*.*';

export type ViewMode = 'grid' | 'list';
export type ThemeMode = 'light' | 'dark' | 'system';
export type { FontFamily } from './lib/fonts';
import type { FontFamily } from './lib/fonts';
export { DEFAULT_FONT_FAMILY } from './lib/fonts';
export type SortColumn = 'name' | 'ext' | 'date' | 'size';
export type SortDir = 'asc' | 'desc';

export interface DirectoryItem {
  name: string;
  href: string;
  type: ItemType;
  ext?: string;
  fileType?: FileType;
  size?: number;
  sizeRaw?: string;
  modified?: string;
  created?: string;
  isParent?: boolean;
  /** Path from the current directory root when found via recursive search. */
  relativePath?: string;
}

export interface ThumbnailSettings {
  enabled: boolean;
  images: boolean;
  videos: boolean;
  text: boolean;
}

export interface OpenDirSettings {
  theme: ThemeMode;
  font: FontFamily;
  view: ViewMode;
  thumbnails: ThumbnailSettings;
  downloadDelayMs: number;
  downloadRandom: boolean;
  sortColumn: SortColumn;
  sortDir: SortDir;
}

export const DEFAULT_SETTINGS: OpenDirSettings = {
  theme: 'light',
  font: 'mono',
  view: 'list',
  thumbnails: { enabled: true, images: false, videos: false, text: true },
  downloadDelayMs: 1500,
  downloadRandom: true,
  sortColumn: 'name',
  sortDir: 'asc',
};

export const PAGE_SIZE = 50;

export const IMAGE_EXTENSIONS = new Set([
  'bmp', 'gif', 'heic', 'ico', 'j2c', 'jp2', 'jpm', 'jpx', 'jxr',
  'png', 'psd', 'svg', 'tif', 'webp', 'jpg', 'jpeg',
]);

export const VIDEO_EXTENSIONS = new Set([
  '3g2', '3gp', 'avif', 'avi', 'flv', 'm4v', 'mkv', 'mov', 'mp4', 'mpg', 'ogv', 'webm',
]);

export const AUDIO_EXTENSIONS = new Set([
  'aac', 'ac3', 'amr', 'ape', 'flac', 'm4a', 'm4b', 'm4p', 'mp3', 'ogg', 'opus', 'spx', 'wav',
]);

export const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'txt', 'md', 'nfo']);

export const CODE_EXTENSIONS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'rb', 'php',
]);

export const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'bz2']);

export const PREVIEWABLE_FILE_TYPES = new Set<FileType>(['image', 'video', 'audio']);
