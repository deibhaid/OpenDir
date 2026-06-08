import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseLinks, isParentLink, parseAnchor } from '../src/content/parser/index';
import {
  classifyExtension,
  formatDate,
  formatSize,
  parseSizeToBytes,
} from '../src/content/parser/format';
import {
  compareItems,
  filterMatchesType,
  getFilteredSortedItems,
} from '../src/content/context/settings';
import type { DirectoryItem } from '../src/content/types';

const APACHE_HTML = `
<!doctype html>
<html>
  <head><title>Index of /downloads/</title></head>
  <body>
    <h1>Index of /downloads/</h1>
    <pre><a href="../">../</a>
<a href="photos/">photos/</a>     07-Jun-2026 10:15    -
<a href="readme.txt">readme.txt</a>  07-Jun-2026 09:44    2048
<a href="clip.mp4">clip.mp4</a>      06-Jun-2026 18:02    12M
</pre>
  </body>
</html>
`;

const NGINX_TABLE_HTML = `
<!doctype html>
<html>
  <head><title>Index of /media/</title></head>
  <body>
    <h1>Index of /media/</h1>
    <table>
      <tr><th>Name</th><th>Last modified</th><th>Size</th><th>Description</th></tr>
      <tr><td><a href="../">Parent Directory</a></td><td>-</td><td>-</td><td></td></tr>
      <tr><td><a href="song.mp3">song.mp3</a></td><td>2026-06-07 11:22</td><td>4.2M</td><td></td></tr>
      <tr><td><a href="cover.png">cover.png</a></td><td>2026-06-07 11:20</td><td>88K</td><td></td></tr>
    </table>
  </body>
</html>
`;

function parseHtml(html: string, url = 'http://example.com/downloads/'): Document {
  return new JSDOM(html, { url }).window.document;
}

describe('parser', () => {
  it('parses Apache pre listings with metadata', () => {
    const items = parseLinks(parseHtml(APACHE_HTML));
    expect(items.some((item) => item.isParent && item.name === '../')).toBe(true);
    const readme = items.find((item) => item.name === 'readme.txt');
    expect(readme?.ext).toBe('txt');
    expect(readme?.fileType).toBe('document');
    expect(readme?.size).toBe(2048);
    expect(readme?.modified).toMatch(/07-Jun-2026/);
    const clip = items.find((item) => item.name === 'clip.mp4');
    expect(clip?.fileType).toBe('video');
    expect(clip?.size).toBe(parseSizeToBytes('12M'));
  });

  it('parses nginx table listings', () => {
    const items = parseLinks(parseHtml(NGINX_TABLE_HTML, 'http://example.com/media/'));
    const song = items.find((item) => item.name === 'song.mp3');
    expect(song?.fileType).toBe('audio');
    expect(song?.size).toBe(parseSizeToBytes('4.2M'));
    const cover = items.find((item) => item.name === 'cover.png');
    expect(cover?.fileType).toBe('image');
  });

  it('detects parent links and skips self/duplicate links', () => {
    expect(isParentLink('..', 'http://example.com/a/b/')).toBe(true);
    const doc = parseHtml(`
      <html><body><pre>
        <a href="?">query</a>
        <a href="#">hash</a>
        <a href="./">.</a>
        <a href="readme.txt">readme.txt</a>
        <a href="readme.txt">readme.txt duplicate</a>
      </pre></body></html>
    `, 'http://example.com/a/readme.txt');
    const anchor = doc.querySelector('a[href="readme.txt"]') as HTMLAnchorElement;
    expect(parseAnchor(anchor, 'http://example.com/a/readme.txt')).toBeNull();
    const items = parseLinks(doc);
    expect(items).toHaveLength(1);
  });
});

describe('format helpers', () => {
  it('classifies extensions and formats size/date', () => {
    expect(classifyExtension('jpg')).toBe('image');
    expect(classifyExtension('mp3')).toBe('audio');
    expect(formatSize(1536)).toBe('1.5 KB');
    expect(formatSize('12M')).toBe('12.0 MB');
    expect(formatDate('07-Jun-2026 10:15')).toMatch(/06\/07\/26 10:15:00/);
  });
});

describe('filter and sort', () => {
  const items: DirectoryItem[] = [
    { name: '../', href: 'http://x/../', type: 'directory', isParent: true },
    { name: 'b.txt', href: 'http://x/b.txt', type: 'file', ext: 'txt', fileType: 'document', size: 10 },
    { name: 'a.png', href: 'http://x/a.png', type: 'file', ext: 'png', fileType: 'image', size: 100 },
  ];

  it('keeps parent first and filters by type', () => {
    const filtered = getFilteredSortedItems(items, '', 'images', 'name', 'asc');
    expect(filtered[0].isParent).toBe(true);
    expect(filtered).toHaveLength(2);
    expect(filterMatchesType(items[2], 'images')).toBe(true);
    expect(filterMatchesType(items[1], 'images')).toBe(false);
  });

  it('sorts by size desc with parent pinned first', () => {
    const sorted = getFilteredSortedItems(items, '', 'all', 'size', 'desc');
    expect(sorted[0].isParent).toBe(true);
    expect(sorted[1].name).toBe('a.png');
    expect(compareItems(items[1], items[2], 'size', 'desc')).toBeGreaterThan(0);
  });
});
