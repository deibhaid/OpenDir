import { describe, expect, it } from 'vitest';
import { getDisplayName } from '../src/content/lib/display';
import type { DirectoryItem } from '../src/content/types';

describe('getDisplayName', () => {
  it('strips extension from file names when ext is known', () => {
    const item: DirectoryItem = {
      name: 'readme.txt',
      href: 'http://x/readme.txt',
      type: 'file',
      ext: 'txt',
    };
    expect(getDisplayName(item)).toBe('readme');
  });

  it('keeps directory and parent names unchanged', () => {
    expect(getDisplayName({ name: '../', href: 'http://x/../', type: 'directory', isParent: true })).toBe('../');
    expect(getDisplayName({ name: 'photos/', href: 'http://x/photos/', type: 'directory' })).toBe('photos/');
  });

  it('strips extension from full href-derived names', () => {
    const item: DirectoryItem = {
      name: 'Alex Archer.-.Rogue Angel Bk01.-.Destiny.zip',
      href: 'http://x/Alex%20Archer.-.Rogue%20Angel%20Bk01.-.Destiny.zip',
      type: 'file',
      ext: 'zip',
    };
    expect(getDisplayName(item)).toBe('Alex Archer.-.Rogue Angel Bk01.-.Destiny');
  });

  it('leaves names without matching extension suffix as-is', () => {
    const item: DirectoryItem = {
      name: 'Neil Gaiman.-.American Gods',
      href: 'http://x/file.zip',
      type: 'file',
      ext: 'zip',
    };
    expect(getDisplayName(item)).toBe('Neil Gaiman.-.American Gods');
  });
});
