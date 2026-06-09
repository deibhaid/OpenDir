import { describe, expect, it } from 'vitest';
import { InjectionTracker } from '../src/background/injectionTracker';
import { injectionKey, pageKey } from '../src/background/pageKey';

describe('pageKey', () => {
  it('normalizes URLs to origin plus pathname', () => {
    expect(pageKey('https://ftp5.gwdg.de/pub/')).toBe('https://ftp5.gwdg.de/pub/');
    expect(pageKey('https://ftp5.gwdg.de/pub/?foo=bar')).toBe('https://ftp5.gwdg.de/pub/');
  });

  it('builds stable injection keys per tab and page', () => {
    expect(injectionKey(12, 'https://ftp5.gwdg.de/pub/')).toBe('12:https://ftp5.gwdg.de/pub/');
  });
});

describe('InjectionTracker', () => {
  it('tracks and clears injections per tab', () => {
    const tracker = new InjectionTracker();
    const url = 'https://ftp5.gwdg.de/pub/';

    expect(tracker.isMarked(1, url)).toBe(false);
    tracker.mark(1, url);
    expect(tracker.isMarked(1, url)).toBe(true);

    tracker.clearTab(1);
    expect(tracker.isMarked(1, url)).toBe(false);
  });

  it('clears only the requested tab', () => {
    const tracker = new InjectionTracker();
    const url = 'https://ftp5.gwdg.de/pub/';

    tracker.mark(1, url);
    tracker.mark(2, url);

    tracker.clearTab(1);

    expect(tracker.isMarked(1, url)).toBe(false);
    expect(tracker.isMarked(2, url)).toBe(true);
  });
});
