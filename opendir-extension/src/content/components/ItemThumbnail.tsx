import { useState } from 'react';
import { Play } from 'lucide-react';
import type { DirectoryItem, ThumbnailSettings } from '../types';
import { cn } from '../lib/utils';
import { FileTypeIcon } from './FileTypeIcon';

interface ItemThumbnailProps {
  item: DirectoryItem;
  thumbnails: ThumbnailSettings;
  className?: string;
  iconClassName?: string;
  showVideoPlayOverlay?: boolean;
}

export function ItemThumbnail({
  item,
  thumbnails,
  className,
  iconClassName,
  showVideoPlayOverlay = false,
}: ItemThumbnailProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const boxClass = cn('shrink-0', className ?? 'h-5 w-5');

  if (item.isParent) {
    return <span className={boxClass} aria-hidden />;
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
            <Play className="h-4 w-4 text-white" />
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
