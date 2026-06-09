import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { getOpenDirTabTitle } from './lib/display';
import { parseDirectoryListing } from './parser';
import { prepareDocumentForOpenDir } from './context/ThemeProvider';
import { loadSettings } from './context/settings';
import { detectDirectoryIndex } from '../shared/directoryIndex';
import './main.css';

interface ExecuteOptions {
  perf: number;
}

export async function mountOpenDir({ perf }: ExecuteOptions): Promise<void> {
  if (document.documentElement.dataset.openDirActive === '1') {
    return;
  }

  if (!detectDirectoryIndex(document)) {
    console.info('[OpenDir] skipped — page is not an open directory listing');
    return;
  }

  const items = parseDirectoryListing(document);

  document.documentElement.dataset.openDirActive = '1';
  document.head.innerHTML = '<meta charset="utf-8">';
  const titleElement = document.createElement('title');
  titleElement.textContent = getOpenDirTabTitle();
  document.head.appendChild(titleElement);

  const settings = await loadSettings();
  prepareDocumentForOpenDir(settings.theme);

  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);

  createRoot(rootElement).render(
    <React.StrictMode>
      <App initialItems={items} />
    </React.StrictMode>,
  );

  console.log(`[OpenDir] mounted ${items.length} items in ${(performance.now() - perf).toFixed(1)}ms`);
}
