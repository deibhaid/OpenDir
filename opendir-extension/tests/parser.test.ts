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
  filterMatchesExtension,
  getDirectoryExtensions,
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

  it('parses table listings with Date and GiB size columns', () => {
    const html = `
      <html><body><table>
        <tr><th>File Name</th><th>File Size</th><th>Date</th></tr>
        <tr><td><a href="../">Parent directory/</a></td><td>-</td><td>-</td></tr>
        <tr><td><a href="fanart.jpg">fanart.jpg</a></td><td>2.0 MiB</td><td>2026-Feb-13 19:16</td></tr>
        <tr><td><a href="movie.mkv">movie.mkv</a></td><td>6.6 GiB</td><td>2026-Apr-19 11:02</td></tr>
      </table></body></html>
    `;
    const items = parseLinks(parseHtml(html, 'https://example.com/movies/'));
    const fanart = items.find((item) => item.name === 'fanart.jpg');
    expect(fanart?.fileType).toBe('image');
    expect(fanart?.modified).toBe('2026-Feb-13 19:16');
    expect(fanart?.size).toBe(2 * 1024 ** 2);
    const movie = items.find((item) => item.name === 'movie.mkv');
    expect(movie?.fileType).toBe('video');
    expect(movie?.size).toBeCloseTo(6.6 * 1024 ** 3, -6);
  });

  it('parses links with malformed percent-encoding without throwing', () => {
    const doc = parseHtml(`
      <html><body><pre>
        <a href="../">../</a>
        <a href="broken%name.txt">broken%name.txt</a>
        <a href="valid%20file.txt">valid file.txt</a>
      </pre></body></html>
    `, 'https://ftp5.gwdg.de/pub/');
    const items = parseLinks(doc);
    expect(items).toHaveLength(3);
    expect(items.find((item) => item.href.includes('broken'))?.name).toBe('broken%name.txt');
    expect(items.find((item) => item.href.includes('valid'))?.name).toBe('valid file.txt');
  });

  it('uses full href basename when link text is truncated by the server', () => {
    const doc = parseHtml(`
      <html><body><pre>
        <a href="Alex%20Archer.-.Rogue%20Angel%20Bk03.-.The%20Spider%20Stone.zip">Alex Archer.-.Rogue Angel Bk03.-.The Spider Sto.</a>
      </pre></body></html>
    `, 'http://example.com/audiobooks/');
    const items = parseLinks(doc);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Alex Archer.-.Rogue Angel Bk03.-.The Spider Stone.zip');
    expect(items[0].ext).toBe('zip');
  });
});

describe('format helpers', () => {
  it('classifies extensions and formats size/date', () => {
    expect(classifyExtension('jpg')).toBe('image');
    expect(classifyExtension('mp3')).toBe('audio');
    expect(formatSize(1536)).toBe('1.5 KB');
    expect(formatSize('12M')).toBe('12.0 MB');
    expect(formatSize('6.6 GiB')).toBe('6.6 GB');
    expect(parseSizeToBytes('2.0 MiB')).toBe(2 * 1024 ** 2);
    expect(formatDate('07-Jun-2026 10:15')).toMatch(/06\/07\/26 10:15:00/);
    expect(formatDate('2026-Apr-19 11:02')).toMatch(/04\/19\/26 11:02:00/);
  });
});

describe('filter and sort', () => {
  const items: DirectoryItem[] = [
    { name: '../', href: 'http://x/../', type: 'directory', isParent: true },
    { name: 'b.txt', href: 'http://x/b.txt', type: 'file', ext: 'txt', fileType: 'document', size: 10 },
    { name: 'a.png', href: 'http://x/a.png', type: 'file', ext: 'png', fileType: 'image', size: 100 },
  ];

  it('keeps parent first and filters by extension', () => {
    const filtered = getFilteredSortedItems(items, '', '*.png', 'name', 'asc');
    expect(filtered[0].isParent).toBe(true);
    expect(filtered).toHaveLength(2);
    expect(filterMatchesExtension(items[2], '*.png')).toBe(true);
    expect(filterMatchesExtension(items[1], '*.png')).toBe(false);
  });

  it('collects unique directory extensions', () => {
    expect(getDirectoryExtensions(items)).toEqual(['png', 'txt']);
  });

  it('sorts by size desc with parent pinned first', () => {
    const sorted = getFilteredSortedItems(items, '', '*.*', 'size', 'desc');
    expect(sorted[0].isParent).toBe(true);
    expect(sorted[1].name).toBe('a.png');
    expect(compareItems(items[1], items[2], 'size', 'desc')).toBeGreaterThan(0);
  });
});
