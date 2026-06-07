import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { parseDirectoryListing } from './parser';
import './main.css';

interface ExecuteOptions {
  perf: number;
}

export function onExecute({ perf }: ExecuteOptions): void {
  if (document.documentElement.dataset.openDirActive === '1') {
    return;
  }

  const items = parseDirectoryListing(document);

  document.documentElement.dataset.openDirActive = '1';
  document.head.innerHTML = '<meta charset="utf-8"><title>OpenDir</title>';
  document.body.innerHTML = '';
  document.body.style.margin = '0';

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
