export type ItemType = 'file' | 'directory';

export type FileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'archive'
  | 'default';

export type FilterType =
  | 'all'
  | 'folders'
  | 'files'
  | 'images'
  | 'videos'
  | 'audio'
  | 'documents'
  | 'code'
  | 'archives';

export type ViewMode = 'grid' | 'list';
export type ThemeMode = 'light' | 'dark' | 'system';
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
}

export interface ThumbnailSettings {
  images: boolean;
  videos: boolean;
}

export interface OpenDirSettings {
  theme: ThemeMode;
  view: ViewMode;
  thumbnails: ThumbnailSettings;
  downloadDelayMs: number;
  downloadRandom: boolean;
  sortColumn: SortColumn;
  sortDir: SortDir;
}

export const DEFAULT_SETTINGS: OpenDirSettings = {
  theme: 'system',
  view: 'list',
  thumbnails: { images: true, videos: false },
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

export const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'txt', 'md']);

export const CODE_EXTENSIONS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'rb', 'php',
]);

export const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'bz2']);

export const PREVIEWABLE_FILE_TYPES = new Set<FileType>(['image', 'video', 'audio']);
