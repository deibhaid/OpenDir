import { injectionKey } from './pageKey';

export class InjectionTracker {
  private readonly injected = new Set<string>();

  mark(tabId: number, url: string): void {
    this.injected.add(injectionKey(tabId, url));
  }

  isMarked(tabId: number, url: string): boolean {
    return this.injected.has(injectionKey(tabId, url));
  }

  clearTab(tabId: number): void {
    for (const key of this.injected) {
      if (key.startsWith(`${tabId}:`)) {
        this.injected.delete(key);
      }
    }
  }
}
