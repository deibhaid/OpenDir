/**
 * Injected as a classic script (not a module). Do not use top-level import/export here.
 * Keep detection logic in sync with src/shared/directoryIndex.ts
 */
(function openDirLoader() {
  const root = document.documentElement;
  if (root.dataset.openDirLoader === '1' || root.dataset.openDirActive === '1') {
    return;
  }
  root.dataset.openDirLoader = '1';

  function detectDirectoryIndex(doc: Document): boolean {
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

    for (const table of Array.from(doc.querySelectorAll('table'))) {
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

  if (!detectDirectoryIndex(document)) {
    return;
  }

  const mainUrl = chrome.runtime.getURL('main.js');
  import(mainUrl)
    .then((module) => {
      const execute = module.onExecute ?? module.default?.onExecute;
      if (typeof execute !== 'function') {
        throw new TypeError('OpenDir main bundle did not export onExecute');
      }
      execute({ perf: performance.now() });
    })
    .catch((error) => {
      console.error('[OpenDir] failed to load main bundle', error);
    });
})();
