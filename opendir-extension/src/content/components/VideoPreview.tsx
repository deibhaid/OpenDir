import { useCallback, useEffect, useRef, useState } from 'react';
import type { DirectoryItem } from '../types';

interface VideoPreviewProps {
  item: DirectoryItem;
  onReadyToPlay?: (play: () => void) => void;
}

export function VideoPreview({ item, onReadyToPlay }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [codecHint, setCodecHint] = useState(false);

  const playWithSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    void video.play().catch(() => {
      // Controls remain available if autoplay is blocked.
    });
  }, []);

  useEffect(() => {
    onReadyToPlay?.(playWithSound);
  }, [onReadyToPlay, playWithSound, item.href]);

  useEffect(() => {
    setCodecHint(false);
    const video = videoRef.current;
    if (!video) return;

    const timer = window.setTimeout(() => {
      const element = video as HTMLVideoElement & { webkitAudioDecodedByteCount?: number };
      if (
        !video.paused &&
        video.currentTime > 1 &&
        typeof element.webkitAudioDecodedByteCount === 'number' &&
        element.webkitAudioDecodedByteCount === 0
      ) {
        setCodecHint(true);
      }
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [item.href]);

  return (
    <div className="flex max-h-full w-full max-w-full flex-col items-center gap-2">
      <video
        ref={videoRef}
        key={item.href}
        src={item.href}
        controls
        playsInline
        className="max-h-full max-w-full rounded-lg"
        onLoadedData={playWithSound}
      />
      {codecHint && (
        <p className="w-full truncate text-center text-xs text-muted-foreground">
          No audio in browser — download for full playback.
        </p>
      )}
    </div>
  );
}
