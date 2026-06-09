import { describe, expect, it } from 'vitest';
import type { DirectoryItem } from '../src/content/types';
import { countListingItems, getFooterText } from '../src/content/context/settings';

const parentItem: DirectoryItem = {
  name: '../',
  href: '../',
  type: 'directory',
  isParent: true,
};

const fileItem: DirectoryItem = {
  name: 'poster.jpg',
  href: 'poster.jpg',
  type: 'file',
  ext: 'jpg',
};

describe('footer item count', () => {
  it('excludes the parent directory link from totals', () => {
    expect(countListingItems([parentItem, fileItem, fileItem, fileItem, fileItem])).toBe(4);
  });

  it('formats unfiltered totals without the parent row', () => {
    expect(getFooterText(4, false)).toBe('Showing all 4 items');
  });

  it('formats filtered totals without the parent row', () => {
    expect(getFooterText(2, true)).toBe('Showing 2 items');
  });
});
