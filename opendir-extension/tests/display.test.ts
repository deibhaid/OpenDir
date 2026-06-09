import { describe, expect, it } from 'vitest';
import { getCurrentDirectoryLabel, getDisplayName, getOpenDirTabTitle } from '../src/content/lib/display';
import type { DirectoryItem } from '../src/content/types';

describe('getCurrentDirectoryLabel', () => {
  it('uses the last path segment', () => {
    expect(getCurrentDirectoryLabel('https://example.com/music/jazz/')).toBe('jazz');
  });

  it('decodes URI-encoded segments', () => {
    expect(getCurrentDirectoryLabel('https://example.com/foo%20bar/')).toBe('foo bar');
  });

  it('returns malformed percent-encoding unchanged', () => {
    expect(getCurrentDirectoryLabel('https://example.com/bad%/')).toBe('bad%');
  });

  it('uses the domain at the site root', () => {
    expect(getCurrentDirectoryLabel('https://example.com/')).toBe('example.com');
  });
});

describe('getOpenDirTabTitle', () => {
  it('prefixes the current directory with OD:', () => {
    expect(getOpenDirTabTitle('https://example.com/repos/OpenDir/')).toBe('OD: OpenDir');
  });

  it('shows the domain at the site root', () => {
    expect(getOpenDirTabTitle('https://example.com/')).toBe('OD: example.com');
  });
});

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
