import { describe, expect, it } from 'vitest';
import { getRangeHrefs } from '../src/content/lib/selection';
import type { DirectoryItem } from '../src/content/types';

function item(href: string, name: string): DirectoryItem {
  return {
    href,
    name,
    type: 'file',
    isParent: false,
  };
}

describe('getRangeHrefs', () => {
  const items = [
    item('/a', 'a'),
    item('/b', 'b'),
    item('/c', 'c'),
    item('/d', 'd'),
    item('/e', 'e'),
  ];

  it('returns inclusive range between anchor and target', () => {
    expect(getRangeHrefs(items, '/b', '/d')).toEqual(['/b', '/c', '/d']);
  });

  it('works when target is above anchor', () => {
    expect(getRangeHrefs(items, '/d', '/b')).toEqual(['/b', '/c', '/d']);
  });

  it('returns empty when anchor or target is missing', () => {
    expect(getRangeHrefs(items, '/missing', '/b')).toEqual([]);
    expect(getRangeHrefs(items, '/b', '/missing')).toEqual([]);
  });

  it('excludes parent directory rows from the range', () => {
    const withParent: DirectoryItem[] = [
      { href: '/..', name: '../', type: 'directory', isParent: true },
      ...items,
    ];
    expect(getRangeHrefs(withParent, '/..', '/c')).toEqual(['/a', '/b', '/c']);
  });
});
