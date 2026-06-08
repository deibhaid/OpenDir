/**
 * Heuristics for Apache/nginx-style open directory index pages.
 * Used by the content loader and unit tests; keep in sync with
 * `detectOpenDirectoryOnPage()` in the service worker.
 */

const SCM_TABLE_HEADER =
  /\b(commit|author|branch|fork|issue|message|pull request|star|watch)\b/i;

function isScmTableHeader(header: string): boolean {
  return SCM_TABLE_HEADER.test(header.trim());
}

function isNameColumnHeader(header: string): boolean {
  const normalized = header.trim().toLowerCase();
  return /\bname\b/.test(normalized) || /\bfile\b/.test(normalized);
}

function isListingMetadataHeader(header: string): boolean {
  const normalized = header.trim().toLowerCase();
  if (isScmTableHeader(normalized)) return false;

  if (normalized.includes('last modified') || normalized.includes('last-modified')) {
    return true;
  }

  if (normalized.includes('modified') && !normalized.includes('commit')) {
    return true;
  }

  if (/\bsize\b/.test(normalized)) {
    return true;
  }

  if (normalized.includes('description')) {
    return true;
  }

  return false;
}

function isKnownNonDirectoryHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return (
    host === 'github.com' ||
    host === 'www.github.com' ||
    host === 'gitlab.com' ||
    host === 'www.gitlab.com' ||
    host === 'bitbucket.org' ||
    host === 'www.bitbucket.org'
  );
}

export function detectDirectoryIndex(doc: Document): boolean {
  const locationHost = doc.location?.hostname ?? '';
  if (locationHost && isKnownNonDirectoryHost(locationHost)) {
    return false;
  }

  const titleMatch = /^index of(\s|\/|$)/i.test(doc.title.trim());
  const h1 = doc.querySelector('h1');
  const h1Match = h1 ? /^index of(\s|\/|$)/i.test((h1.textContent ?? '').trim()) : false;

  const preLinks = Array.from(doc.querySelectorAll('pre a[href]'));
  const preLinkCount = preLinks.length;
  const parentOnly =
    preLinkCount === 1 &&
    (preLinks[0].getAttribute('href')?.trim() === '..' ||
      preLinks[0].getAttribute('href')?.trim() === '../');

  if (titleMatch || h1Match || preLinkCount >= 2 || parentOnly) {
    return true;
  }

  return hasDirectoryIndexTable(doc);
}

function hasDirectoryIndexTable(doc: Document): boolean {
  for (const table of Array.from(doc.querySelectorAll('table'))) {
    const headerRow = table.querySelector('tr');
    if (!headerRow) continue;

    const headers = Array.from(headerRow.querySelectorAll('th, td')).map((cell) =>
      (cell.textContent ?? '').trim(),
    );
    if (headers.length === 0) continue;

    if (headers.some((header) => isScmTableHeader(header))) {
      continue;
    }

    const hasNameColumn = headers.some((header) => isNameColumnHeader(header));
    const hasListingColumn = headers.some((header) => isListingMetadataHeader(header));
    const hasLinks = table.querySelector('a[href]');

    if (hasNameColumn && hasListingColumn && hasLinks) {
      return true;
    }
  }

  return false;
}
