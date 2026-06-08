import type { DirectoryItem } from '../types';
import { classifyExtension, getExtension, isDirectoryName, parseSizeToBytes } from './format';

export function isParentLink(href: string, baseUrl: string): boolean {
  const normalized = href.trim();
  if (normalized === '..' || normalized === '../' || normalized.endsWith('/../')) {
    return true;
  }

  try {
    const resolved = new URL(normalized, baseUrl);
    const base = new URL(baseUrl);
    const parentPath = base.pathname.replace(/\/?$/, '/').replace(/[^/]+\/$/, '');
    const resolvedPath = resolved.pathname.endsWith('/')
      ? resolved.pathname
      : `${resolved.pathname}/`;
    return resolvedPath === parentPath || resolvedPath === `${parentPath}../`.replace(/\/+/g, '/');
  } catch {
    return normalized === '..';
  }
}

export function basenameFromHref(href: string, hrefAttr: string): string {
  try {
    const segment = new URL(href).pathname.split('/').filter(Boolean).pop();
    if (segment) return decodeURIComponent(segment);
  } catch {
    // fall through
  }

  const fromAttr = hrefAttr.split('?')[0].replace(/\/$/, '').split('/').pop();
  return fromAttr ? decodeURIComponent(fromAttr) : hrefAttr;
}

export function parseAnchor(anchor: HTMLAnchorElement, baseUrl: string): DirectoryItem | null {
  const hrefAttr = anchor.getAttribute('href');
  if (!hrefAttr || hrefAttr === '?' || hrefAttr.startsWith('#')) return null;

  let href: string;
  try {
    href = new URL(hrefAttr, baseUrl).href;
  } catch {
    return null;
  }

  const current = new URL(baseUrl);
  const currentNoQuery = `${current.origin}${current.pathname}`;
  const hrefUrl = new URL(href);
  const hrefNoQuery = `${hrefUrl.origin}${hrefUrl.pathname}`;
  if (hrefNoQuery === currentNoQuery) return null;

  const linkText = (anchor.textContent ?? '').trim();
  const parent = isParentLink(hrefAttr, baseUrl);

  if (parent) {
    return {
      name: '../',
      href,
      type: 'directory',
      isParent: true,
    };
  }

  // Prefer href basename — directory servers often truncate visible link text.
  const hrefName = basenameFromHref(href, hrefAttr);
  const name =
    hrefName ||
    linkText.replace(/\/$/, '') ||
    hrefAttr.replace(/\/$/, '').split('/').pop() ||
    hrefAttr;
  const isDir = isDirectoryName(name, hrefAttr);
  const ext = isDir ? undefined : getExtension(name);

  return {
    name: isDir && !name.endsWith('/') ? `${name}/` : name,
    href,
    type: isDir ? 'directory' : 'file',
    ext,
    fileType: isDir ? undefined : classifyExtension(ext),
  };
}

export function extractPreMetadata(
  anchor: HTMLAnchorElement,
  preElement: HTMLPreElement,
): Pick<DirectoryItem, 'size' | 'sizeRaw' | 'modified' | 'created'> {
  const lines = (preElement.textContent ?? '').split('\n');
  const linkText = (anchor.textContent ?? '').trim();

  for (const line of lines) {
    if (!line.includes(linkText)) continue;
    const dateMatch = line.match(/(\d{2}-\w{3}-\d{4}\s+\d{2}:\d{2})/i);
    const sizeMatch = line.match(/\s(-|\d[\d,.]*[KMG]?)\s*(?:$|\s)/i);
    const sizeRaw = sizeMatch?.[1]?.trim();
    const modified = dateMatch?.[1];
    const size = sizeRaw ? parseSizeToBytes(sizeRaw) : undefined;
    return { size, sizeRaw, modified, created: modified };
  }

  return {};
}

interface TableColumnMap {
  name?: number;
  size?: number;
  modified?: number;
  description?: number;
}

export function extractTableMetadata(table: HTMLTableElement): Map<string, Pick<DirectoryItem, 'size' | 'sizeRaw' | 'modified' | 'created'>> {
  const result = new Map<string, Pick<DirectoryItem, 'size' | 'sizeRaw' | 'modified' | 'created'>>();
  const headerRow = table.querySelector('tr');
  if (!headerRow) return result;

  const headers = Array.from(headerRow.querySelectorAll('th, td')).map((cell) =>
    (cell.textContent ?? '').trim().toLowerCase(),
  );

  const columnMap: TableColumnMap = {};
  headers.forEach((header, index) => {
    if (header.includes('name') || header.includes('file')) columnMap.name = index;
    else if (header.includes('size')) columnMap.size = index;
    else if (header.includes('modified') || header.includes('last')) columnMap.modified = index;
    else if (header.includes('description')) columnMap.description = index;
  });

  const rows = Array.from(table.querySelectorAll('tr')).slice(1);
  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('td, th'));
    const anchor = row.querySelector('a[href]');
    if (!anchor) continue;
    const key = anchor.getAttribute('href') ?? '';
    const sizeRaw = columnMap.size !== undefined ? (cells[columnMap.size]?.textContent ?? '').trim() : undefined;
    const modified = columnMap.modified !== undefined ? (cells[columnMap.modified]?.textContent ?? '').trim() : undefined;
    result.set(key, {
      size: sizeRaw ? parseSizeToBytes(sizeRaw) : undefined,
      sizeRaw,
      modified,
      created: modified,
    });
  }

  return result;
}

export function parseLinks(documentRef: Document): DirectoryItem[] {
  const baseUrl = documentRef.location.href;
  const seen = new Set<string>();
  const items: DirectoryItem[] = [];

  const preAnchors = Array.from(documentRef.querySelectorAll('pre a[href]'));
  const tableAnchors = Array.from(documentRef.querySelectorAll('table a[href]'));
  const anchors = preAnchors.length > 0 || tableAnchors.length > 0
    ? [...preAnchors, ...tableAnchors]
    : Array.from(documentRef.links);

  const table = documentRef.querySelector('table');
  const tableMeta = table ? extractTableMetadata(table) : new Map();

  for (const anchor of anchors) {
    const link = anchor as HTMLAnchorElement;
    const parsed = parseAnchor(link, baseUrl);
    if (!parsed) continue;
    if (seen.has(parsed.href)) continue;
    seen.add(parsed.href);

    const pre = link.closest('pre');
    if (pre) {
      Object.assign(parsed, extractPreMetadata(link, pre));
    }

    const hrefKey = link.getAttribute('href') ?? '';
    const tableData = tableMeta.get(hrefKey);
    if (tableData) {
      Object.assign(parsed, tableData);
    }

    items.push(parsed);
  }

  return items;
}

export function parseDirectoryListing(documentRef: Document = document): DirectoryItem[] {
  return parseLinks(documentRef);
}
