import { describe, expect, it } from 'vitest';
import { compareItemsByRelativePath, getFilteredSortedItems } from '../src/content/context/settings';
import type { DirectoryItem } from '../src/content/types';

function item(overrides: Partial<DirectoryItem> & Pick<DirectoryItem, 'name' | 'href'>): DirectoryItem {
  return {
    type: 'file',
    ...overrides,
  };
}

describe('compareItemsByRelativePath', () => {
  it('sorts by relative path then file name', () => {
    const a = item({
      name: 'fanart.jpg',
      href: 'https://x/a/fanart.jpg',
      relativePath: 'Beta/',
    });
    const b = item({
      name: 'fanart.jpg',
      href: 'https://x/b/fanart.jpg',
      relativePath: 'Alpha/',
    });

    expect(compareItemsByRelativePath(a, b)).toBeGreaterThan(0);
    expect(compareItemsByRelativePath(b, a)).toBeLessThan(0);
  });
});

describe('getFilteredSortedItems recursive sort', () => {
  it('can sort recursive results by relative path', () => {
    const items: DirectoryItem[] = [
      item({ name: 'z.jpg', href: 'https://x/z/z.jpg', relativePath: 'Z/' }),
      item({ name: 'a.jpg', href: 'https://x/a/a.jpg', relativePath: 'A/' }),
    ];

    const sorted = getFilteredSortedItems(items, '', '*.*', 'name', 'asc', {
      recursiveSortByPath: true,
    });

    expect(sorted.map((entry) => entry.relativePath)).toEqual(['A/', 'Z/']);
  });
});
