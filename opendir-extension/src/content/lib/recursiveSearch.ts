import { detectDirectoryIndex } from '../../shared/directoryIndex';
import { parseDirectoryListingFromHtml } from '../parser';
import type { DirectoryItem } from '../types';
import { filterMatchesExtension } from '../context/settings';

const FETCH_CONCURRENCY = 4;

export function normalizeDirectoryUrl(url: string): string {
  const parsed = new URL(url);
  if (!parsed.pathname.endsWith('/')) {
    parsed.pathname = `${parsed.pathname}/`;
  }
  parsed.search = '';
  parsed.hash = '';
  return parsed.href;
}

export function isDescendantDirectoryUrl(targetUrl: string, rootUrl: string): boolean {
  const target = new URL(targetUrl);
  const root = new URL(rootUrl);
  if (target.origin !== root.origin) return false;

  const rootPath = normalizeDirectoryUrl(root.href);
  const targetPath = normalizeDirectoryUrl(target.href);
  return targetPath.startsWith(rootPath) && targetPath !== rootPath;
}

export function getRelativeDirectoryPath(itemUrl: string, rootUrl: string): string {
  const item = new URL(itemUrl);
  const root = new URL(rootUrl);
  const rootPath = root.pathname.endsWith('/') ? root.pathname : `${root.pathname}/`;
  let relative = item.pathname.startsWith(rootPath) ? item.pathname.slice(rootPath.length) : item.pathname;
  relative = relative.replace(/^\/+/, '');
  if (relative && !relative.endsWith('/')) {
    const segments = relative.split('/');
    segments.pop();
    relative = segments.length > 0 ? `${segments.join('/')}/` : '';
  }
  return relative;
}

export function itemMatchesSearch(
  item: DirectoryItem,
  query: string,
  extensionFilter: string,
): boolean {
  if (item.isParent) return false;
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery && !item.name.toLowerCase().includes(normalizedQuery)) return false;
  return filterMatchesExtension(item, extensionFilter);
}

export function withRelativePath(item: DirectoryItem, rootUrl: string): DirectoryItem {
  const relativePath = getRelativeDirectoryPath(item.href, rootUrl);
  if (!relativePath) return item;
  return { ...item, relativePath };
}

async function fetchDirectoryItems(dirUrl: string, signal: AbortSignal): Promise<DirectoryItem[]> {
  const response = await fetch(dirUrl, { signal, credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${dirUrl}: ${response.status}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!detectDirectoryIndex(doc)) {
    return [];
  }

  return parseDirectoryListingFromHtml(html, dirUrl);
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await mapper(values[current]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, values.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function searchRecursively(
  seedItems: DirectoryItem[],
  rootUrl: string,
  query: string,
  extensionFilter: string,
  signal: AbortSignal,
): Promise<DirectoryItem[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return seedItems;
  }

  const parent = seedItems.find((item) => item.isParent);
  const matches: DirectoryItem[] = [];
  const visited = new Set<string>();
  const queue: string[] = [];

  for (const item of seedItems) {
    if (item.isParent) continue;
    if (itemMatchesSearch(item, normalizedQuery, extensionFilter)) {
      matches.push(item);
    }
    if (item.type === 'directory') {
      const dirUrl = normalizeDirectoryUrl(item.href);
      if (!visited.has(dirUrl)) {
        visited.add(dirUrl);
        queue.push(item.href);
      }
    }
  }

  while (queue.length > 0 && !signal.aborted) {
    const batch = queue.splice(0, FETCH_CONCURRENCY);
    const listings = await mapWithConcurrency(batch, FETCH_CONCURRENCY, async (dirUrl) => {
      try {
        return await fetchDirectoryItems(dirUrl, signal);
      } catch {
        return [];
      }
    });

    for (const listing of listings) {
      for (const item of listing) {
        if (item.isParent) continue;
        if (!isDescendantDirectoryUrl(item.href, rootUrl)) continue;

        const enriched = withRelativePath(item, rootUrl);
        if (itemMatchesSearch(enriched, normalizedQuery, extensionFilter)) {
          matches.push(enriched);
        }

        if (item.type === 'directory') {
          const normalized = normalizeDirectoryUrl(item.href);
          if (!visited.has(normalized)) {
            visited.add(normalized);
            queue.push(item.href);
          }
        }
      }
    }
  }

  return parent ? [parent, ...matches] : matches;
}
