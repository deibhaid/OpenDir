import type { DirectoryItem } from '../types';

export function getSelectedFileUrls(
  items: DirectoryItem[],
  selectedHrefs: Set<string>,
): string[] {
  return items
    .filter((item) => !item.isParent && item.type === 'file' && selectedHrefs.has(item.href))
    .map((item) => item.href);
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function copySelectedUrls(
  items: DirectoryItem[],
  selectedHrefs: Set<string>,
): Promise<boolean> {
  const urls = getSelectedFileUrls(items, selectedHrefs);
  if (urls.length === 0) return false;
  return copyTextToClipboard(urls.join('\n'));
}
