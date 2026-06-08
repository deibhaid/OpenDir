import type { DirectoryItem } from '../types';

export function getRangeHrefs(
  items: DirectoryItem[],
  anchorHref: string,
  targetHref: string,
): string[] {
  const anchorIndex = items.findIndex((item) => item.href === anchorHref);
  const targetIndex = items.findIndex((item) => item.href === targetHref);
  if (anchorIndex === -1 || targetIndex === -1) return [];

  const start = Math.min(anchorIndex, targetIndex);
  const end = Math.max(anchorIndex, targetIndex);
  return items.slice(start, end + 1).map((item) => item.href);
}
