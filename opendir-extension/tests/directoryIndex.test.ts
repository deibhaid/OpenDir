import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { detectDirectoryIndex } from '../src/shared/directoryIndex';

function doc(html: string, url = 'http://example.com/dir/'): Document {
  return new JSDOM(html, { url }).window.document;
}

describe('detectDirectoryIndex', () => {
  it('detects Apache pre listings', () => {
    const html = `
      <html><head><title>Index of /dir/</title></head><body><pre>
        <a href="../">../</a>
        <a href="a.txt">a.txt</a>
      </pre></body></html>
    `;
    expect(detectDirectoryIndex(doc(html))).toBe(true);
  });

  it('detects nginx table listings', () => {
    const html = `
      <html><body><table>
        <tr><th>Name</th><th>Last modified</th><th>Size</th></tr>
        <tr><td><a href="file.zip">file.zip</a></td><td>-</td><td>1K</td></tr>
      </table></body></html>
    `;
    expect(detectDirectoryIndex(doc(html))).toBe(true);
  });

  it('rejects normal pages with unrelated tables', () => {
    const html = `
      <html><head><title>Dashboard</title></head><body>
        <table><tr><th>User</th><th>Email</th></tr>
        <tr><td><a href="/u/1">Alice</a></td><td>a@x.com</td></tr></table>
      </body></html>
    `;
    expect(detectDirectoryIndex(doc(html))).toBe(false);
  });

  it('rejects empty pages', () => {
    expect(detectDirectoryIndex(doc('<html><body><p>Hello</p></body></html>'))).toBe(false);
  });
});
