import { describe, expect, it } from 'vitest';
import {
  getRelativeDirectoryPath,
  isDescendantDirectoryUrl,
  itemMatchesSearch,
  normalizeDirectoryUrl,
} from '../src/content/lib/recursiveSearch';
import type { DirectoryItem } from '../src/content/types';

function item(overrides: Partial<DirectoryItem> & Pick<DirectoryItem, 'name' | 'href'>): DirectoryItem {
  return {
    type: 'file',
    ...overrides,
  };
}

describe('recursiveSearch helpers', () => {
  it('normalizes directory URLs with a trailing slash', () => {
    expect(normalizeDirectoryUrl('https://example.com/docs')).toBe('https://example.com/docs/');
  });

  it('detects descendant directory URLs under the current root', () => {
    const root = 'https://example.com/docs/music/';
    expect(isDescendantDirectoryUrl('https://example.com/docs/music/a/', root)).toBe(true);
    expect(isDescendantDirectoryUrl('https://example.com/docs/other/', root)).toBe(false);
    expect(isDescendantDirectoryUrl('https://example.com/docs/', root)).toBe(false);
  });

  it('builds a relative directory path for nested items', () => {
    const root = 'https://example.com/docs/music/';
    expect(getRelativeDirectoryPath('https://example.com/docs/music/a/song.mp3', root)).toBe('a/');
  });

  it('matches item names and extension filters', () => {
    const mp3 = item({ name: 'song.mp3', href: '/song.mp3', ext: 'mp3' });
    const folder = item({ name: 'Album/', href: '/Album/', type: 'directory' });

    expect(itemMatchesSearch(mp3, 'song', '*.*')).toBe(true);
    expect(itemMatchesSearch(mp3, 'song', '*.mp3')).toBe(true);
    expect(itemMatchesSearch(mp3, 'song', '*.jpg')).toBe(false);
    expect(itemMatchesSearch(folder, 'album', '*.*')).toBe(true);
    expect(itemMatchesSearch(folder, 'album', '*.mp3')).toBe(false);
  });
});
