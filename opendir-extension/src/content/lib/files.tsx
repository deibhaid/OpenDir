import { FileTypeIcon } from '../components/FileTypeIcon';
import type { DirectoryItem } from '../types';

export { FileTypeIcon };

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
