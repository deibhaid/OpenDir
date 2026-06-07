import {
  Archive,
  Code2,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
} from 'lucide-react';
import type { DirectoryItem, FileType } from '../types';

export function getFileTypeClass(fileType?: FileType, isDirectory?: boolean): string {
  if (isDirectory) return 'file-type-folder';
  switch (fileType) {
    case 'image':
      return 'file-type-image';
    case 'video':
      return 'file-type-video';
    case 'audio':
      return 'file-type-audio';
    case 'document':
      return 'file-type-document';
    case 'code':
      return 'file-type-code';
    case 'archive':
      return 'file-type-archive';
    default:
      return 'file-type-default';
  }
}

export function FileTypeIcon({
  item,
  className = 'h-5 w-5',
}: {
  item: DirectoryItem;
  className?: string;
}) {
  const iconClass = `${className} ${getFileTypeClass(item.fileType, item.type === 'directory')}`;

  if (item.type === 'directory' || item.isParent) {
    return <Folder className={iconClass} aria-hidden />;
  }

  switch (item.fileType) {
    case 'image':
      return <FileImage className={iconClass} aria-hidden />;
    case 'video':
      return <FileVideo className={iconClass} aria-hidden />;
    case 'audio':
      return <FileAudio className={iconClass} aria-hidden />;
    case 'document':
      return <FileText className={iconClass} aria-hidden />;
    case 'code':
      return <Code2 className={iconClass} aria-hidden />;
    case 'archive':
      return <Archive className={iconClass} aria-hidden />;
    default:
      return <File className={iconClass} aria-hidden />;
  }
}

export function triggerDownload(href: string, filename?: string): void {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename ?? '';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadSelectedFiles(
  items: DirectoryItem[],
  selectedHrefs: Set<string>,
  delayMs: number,
  random: boolean,
): Promise<void> {
  const files = items.filter(
    (item) => selectedHrefs.has(item.href) && item.type === 'file' && !item.isParent,
  );

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (index > 0) {
      const gap = random
        ? 250 + Math.random() * (delayMs - 250)
        : delayMs;
      await new Promise((resolve) => setTimeout(resolve, gap));
    }
    triggerDownload(file.href, file.name);
  }
}
