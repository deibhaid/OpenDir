const injectedSet = new Set<string>();

export function feIsHttp(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function injectionKey(tabId: number, url: string): string {
  try {
    const parsed = new URL(url);
    return `${tabId}:${parsed.origin}${parsed.pathname}`;
  } catch {
    return `${tabId}:${url.split('?')[0]}`;
  }
}

function markInjected(tabId: number, url: string): void {
  injectedSet.add(injectionKey(tabId, url));
}

function isAlreadyInjected(tabId: number, url: string): boolean {
  return injectedSet.has(injectionKey(tabId, url));
}

export async function injectOpenDir(tabId: number, url: string): Promise<void> {
  if (isAlreadyInjected(tabId, url)) return;

  await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: ['loader.js'],
  });

  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ['content.css'],
  });

  markInjected(tabId, url);
}

/**
 * Self-contained open-directory check for chrome.scripting.executeScript.
 * Keep in sync with src/shared/directoryIndex.ts
 */
function detectOpenDirectoryOnPage(): boolean {
  const scmTableHeader =
    /\b(commit|author|branch|fork|issue|message|pull request|star|watch)\b/i;

  function isScmTableHeader(header: string): boolean {
    return scmTableHeader.test(header.trim());
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

  const locationHost = document.location?.hostname ?? '';
  if (locationHost && isKnownNonDirectoryHost(locationHost)) {
    return false;
  }

  const titleMatch = /^index of(\s|\/|$)/i.test(document.title.trim());
  const h1 = document.querySelector('h1');
  const h1Match = h1 ? /^index of(\s|\/|$)/i.test((h1.textContent ?? '').trim()) : false;

  const preLinks = Array.from(document.querySelectorAll('pre a[href]'));
  const preLinkCount = preLinks.length;
  const parentOnly =
    preLinkCount === 1 &&
    (preLinks[0].getAttribute('href')?.trim() === '..' ||
      preLinks[0].getAttribute('href')?.trim() === '../');

  if (titleMatch || h1Match || preLinkCount >= 2 || parentOnly) {
    return true;
  }

  for (const table of Array.from(document.querySelectorAll('table'))) {
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

export async function pageLooksLikeOpenDirectory(tabId: number): Promise<boolean> {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: detectOpenDirectoryOnPage,
  });
  return Boolean(result);
}

export async function feMaybeAutoInject(tabId: number, url: string): Promise<void> {
  if (!feIsHttp(url)) return;
  if (isAlreadyInjected(tabId, url)) return;

  const [{ result: alreadyActive }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => document.documentElement.dataset.openDirActive === '1',
  });
  if (alreadyActive) return;

  const isOpenDirectory = await pageLooksLikeOpenDirectory(tabId);
  if (isOpenDirectory) {
    await injectOpenDir(tabId, url);
  }
}

async function hasFileAccess(): Promise<boolean> {
  return chrome.extension.isAllowedFileSchemeAccess();
}

chrome.tabs.onRemoved.addListener((tabId) => {
  for (const key of injectedSet) {
    if (key.startsWith(`${tabId}:`)) {
      injectedSet.delete(key);
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  const url = tab.url ?? changeInfo.url;
  if (!url || !feIsHttp(url)) return;
  void feMaybeAutoInject(tabId, url);
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) return;

  if (!(tab.url.startsWith('file://') || feIsHttp(tab.url))) {
    return;
  }

  if (tab.url.startsWith('file://')) {
    const allowed = await hasFileAccess();
    if (!allowed) {
      await chrome.tabs.create({ url: chrome.runtime.getURL('file-access-help.html') });
      return;
    }
  }

  const [{ result: alreadyActive }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.dataset.openDirActive === '1',
  });
  if (alreadyActive) return;

  const isOpenDirectory = await pageLooksLikeOpenDirectory(tab.id);
  if (!isOpenDirectory) return;

  await injectOpenDir(tab.id, tab.url);
});

console.log('[OpenDir] service worker ready');
