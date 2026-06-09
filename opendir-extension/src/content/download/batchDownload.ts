import type { DirectoryItem } from '../types';
import { safeDecodeURIComponent } from '../lib/url';

export function clampDelayMs(ms: number): number {
  return Math.max(250, ms);
}

/** Gap between consecutive batch downloads (not applied before the first file). */
export function computeGap(delayMs: number, random: boolean, randomValue = Math.random()): number {
  const D = clampDelayMs(delayMs);
  if (random) {
    return 250 + randomValue * (D - 250);
  }
  return D;
}

/** Cumulative offsets (ms) for each file in a batch download queue. */
export function computeDownloadOffsets(
  fileCount: number,
  delayMs: number,
  random: boolean,
  randomFn: () => number = Math.random,
): number[] {
  if (fileCount <= 0) return [];
  const offsets = [0];
  let cumulative = 0;
  for (let index = 1; index < fileCount; index += 1) {
    cumulative += computeGap(delayMs, random, randomFn());
    offsets.push(cumulative);
  }
  return offsets;
}

export function getDownloadFilename(item: DirectoryItem): string {
  try {
    const url = new URL(item.href);
    const segment = safeDecodeURIComponent(url.pathname.split('/').filter(Boolean).pop() ?? '');
    return segment || item.name;
  } catch {
    return item.name;
  }
}

export function triggerAnchorDownload(href: string, filename?: string): void {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename ?? '';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function downloadSelected(
  items: DirectoryItem[],
  selectedHrefs: Set<string>,
  downloadDelayMs: number,
  downloadRandom: boolean,
): void {
  const files = items.filter(
    (item) => selectedHrefs.has(item.href) && item.type === 'file' && !item.isParent,
  );
  if (files.length === 0) return;

  let offsetMs = 0;
  files.forEach((file, index) => {
    setTimeout(() => {
      triggerAnchorDownload(file.href, getDownloadFilename(file));
    }, offsetMs);
    if (index < files.length - 1) {
      offsetMs += computeGap(downloadDelayMs, downloadRandom);
    }
  });
}
