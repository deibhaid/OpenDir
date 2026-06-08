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
import { getCategoryStyle } from './category';
import type { DirectoryItem } from '../types';

export function FileTypeIcon({
  item,
  className = 'h-5 w-5',
}: {
  item: DirectoryItem;
  className?: string;
}) {
  const style = getCategoryStyle(item);
  const iconClass = `${className} ${style.text}`;

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
      const gap = random ? 250 + Math.random() * (delayMs - 250) : delayMs;
      await new Promise((resolve) => setTimeout(resolve, gap));
    }
    triggerDownload(file.href, file.name);
  }
}
