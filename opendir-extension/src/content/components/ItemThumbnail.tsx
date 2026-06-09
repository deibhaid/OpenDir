import { useState } from 'react';
import { Play } from 'lucide-react';
import type { DirectoryItem, ThumbnailSettings } from '../types';
import { isTextPreviewItem } from '../lib/preview';
import { cn } from '../lib/utils';
import { FileTypeIcon } from './FileTypeIcon';
import { TextSnippetThumbnail, type TextSnippetVariant } from './TextSnippetThumbnail';

interface ItemThumbnailProps {
  item: DirectoryItem;
  thumbnails: ThumbnailSettings;
  className?: string;
  iconClassName?: string;
  showVideoPlayOverlay?: boolean;
  textVariant?: TextSnippetVariant;
}

function EmptyThumbnailSlot({ className }: { className?: string }) {
  return <span className={cn('shrink-0', className ?? 'h-5 w-5')} aria-hidden />;
}

export function ItemThumbnail({
  item,
  thumbnails,
  className,
  iconClassName,
  showVideoPlayOverlay = false,
  textVariant = 'card',
}: ItemThumbnailProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const boxClass = cn('shrink-0', className ?? 'h-5 w-5');

  if (item.isParent) {
    return <EmptyThumbnailSlot className={className} />;
  }

  if (!thumbnails.enabled) {
    return <EmptyThumbnailSlot className={className} />;
  }

  if (item.fileType === 'image' && thumbnails.images && !imageFailed) {
    return (
      <img
        src={item.href}
        alt=""
        loading="lazy"
        onError={() => setImageFailed(true)}
        className={cn('rounded object-cover', boxClass)}
      />
    );
  }

  if (thumbnails.text && isTextPreviewItem(item)) {
    return (
      <TextSnippetThumbnail
        item={item}
        className={boxClass}
        iconClassName={iconClassName}
        variant={textVariant}
      />
    );
  }

  if (item.fileType === 'video' && thumbnails.videos && !videoFailed) {
    return (
      <div className={cn('relative overflow-hidden rounded', boxClass)}>
        <video
          src={`${item.href}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          onError={() => setVideoFailed(true)}
          className="h-full w-full object-cover"
        />
        {showVideoPlayOverlay && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play
              className={cn(
                'text-white',
                textVariant === 'compact' ? 'h-2.5 w-2.5' : 'h-4 w-4',
              )}
            />
          </span>
        )}
      </div>
    );
  }

  return (
    <span className={cn('flex items-center justify-center', boxClass)}>
      <FileTypeIcon item={item} className={iconClassName ?? 'h-5 w-5'} />
    </span>
  );
}
