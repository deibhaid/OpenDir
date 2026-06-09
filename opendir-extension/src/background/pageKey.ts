/** Stable page identity for injection tracking and per-page preferences. */
export function pageKey(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split('?')[0];
  }
}

export function injectionKey(tabId: number, url: string): string {
  return `${tabId}:${pageKey(url)}`;
}
