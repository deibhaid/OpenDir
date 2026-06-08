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
      (cell.textContent ?? '').trim().toLowerCase(),
    );
    if (headers.length === 0) continue;

    const hasNameColumn = headers.some(
      (header) => header.includes('name') || header.includes('file'),
    );
    const hasListingColumn = headers.some(
      (header) =>
        header.includes('size') ||
        header.includes('modified') ||
        header.includes('last') ||
        header.includes('description'),
    );
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
