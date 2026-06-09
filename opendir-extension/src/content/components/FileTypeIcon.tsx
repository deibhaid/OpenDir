import type { DirectoryItem } from '../types';
import { cn } from '../lib/utils';

interface IconProps {
  className?: string;
}

function FolderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4H8l1.6 1.6A1.5 1.5 0 0 0 10.7 6H16.5A1.5 1.5 0 0 1 18 7.5V15a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 15V5.5Z" />
    </svg>
  );
}

function ArchiveFileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2h5.2l.3.3 1.7 1.7H14.5A1.5 1.5 0 0 1 16 5.5V16a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 2 16V3.5Z" />
      <path fill="rgba(255,255,255,0.85)" d="M7 8h6v1.2H7V8Zm0 2.4h6v1.2H7v-1.2Zm0 2.4h4.2v1.2H7v-1.2Z" />
    </svg>
  );
}

function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M6 2.5A1.5 1.5 0 0 1 7.5 1h3.1l3.4 3.4V16.5A1.5 1.5 0 0 1 12.5 18h-7A1.5 1.5 0 0 1 4 16.5v-14Z" />
      <path fill="rgba(255,255,255,0.85)" d="M10.6 1.8V4.2c0 .5.4.8.9.8h2.3L10.6 1.8Z" />
    </svg>
  );
}

function ImageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2h9A1.5 1.5 0 0 1 16 3.5v13A1.5 1.5 0 0 1 14.5 18h-9A1.5 1.5 0 0 1 4 16.5v-13Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="rgba(255,255,255,0.9)" />
      <path fill="rgba(255,255,255,0.85)" d="m5 14 3.2-3.2a1 1 0 0 1 1.4 0L14 15.5H5V14Z" />
    </svg>
  );
}

function VideoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2h9A1.5 1.5 0 0 1 16 3.5v13A1.5 1.5 0 0 1 14.5 18h-9A1.5 1.5 0 0 1 4 16.5v-13Z" />
      <path fill="rgba(255,255,255,0.9)" d="M8.5 7.5v5l4.5-2.5-4.5-2.5Z" />
    </svg>
  );
}

function AudioIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M11.5 3.2a1 1 0 0 1 1.5.86V15.9a3.5 3.5 0 1 1-1.5-2.86V6.3l-4-.8v8.3a3.5 3.5 0 1 1-1.5-2.86V4.5a1 1 0 0 1 .78-.98l5.5-1.1Z" />
    </svg>
  );
}

function CodeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2h9A1.5 1.5 0 0 1 16 3.5v13A1.5 1.5 0 0 1 14.5 18h-9A1.5 1.5 0 0 1 4 16.5v-13Z" />
      <path fill="rgba(255,255,255,0.9)" d="m7.2 7.8-1.4 1.4 1.4 1.4-1 1 2.4-2.4-2.4-2.4 1 1Zm5.6 0 1 1-2.4 2.4 2.4 2.4-1 1-1.4-1.4 1.4-1.4-1.4-1.4 1.4-1.4Z" />
    </svg>
  );
}

function GenericFileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M6 2.5A1.5 1.5 0 0 1 7.5 1h3.1l3.4 3.4V16.5A1.5 1.5 0 0 1 12.5 18h-7A1.5 1.5 0 0 1 4 16.5v-14Z" />
    </svg>
  );
}

const COLOR_MAP = {
  folder: 'text-blue-500',
  archive: 'text-amber-500',
  document: 'text-rose-500',
  image: 'text-emerald-500',
  video: 'text-violet-500',
  audio: 'text-orange-500',
  code: 'text-cyan-500',
  default: 'text-slate-500',
} as const;

export function FileTypeIcon({
  item,
  className,
}: {
  item: DirectoryItem;
  className?: string;
}) {
  const iconClass = cn('h-5 w-5 shrink-0', className);

  if (item.isParent) {
    return null;
  }

  if (item.type === 'directory') {
    return <FolderIcon className={cn(iconClass, COLOR_MAP.folder)} />;
  }

  switch (item.fileType) {
    case 'image':
      return <ImageIcon className={cn(iconClass, COLOR_MAP.image)} />;
    case 'video':
      return <VideoIcon className={cn(iconClass, COLOR_MAP.video)} />;
    case 'audio':
      return <AudioIcon className={cn(iconClass, COLOR_MAP.audio)} />;
    case 'document':
      return <DocumentIcon className={cn(iconClass, COLOR_MAP.document)} />;
    case 'code':
      return <CodeIcon className={cn(iconClass, COLOR_MAP.code)} />;
    case 'archive':
      return <ArchiveFileIcon className={cn(iconClass, COLOR_MAP.archive)} />;
    default:
      return <GenericFileIcon className={cn(iconClass, COLOR_MAP.default)} />;
  }
}

export { COLOR_MAP as fileTypeColors };
