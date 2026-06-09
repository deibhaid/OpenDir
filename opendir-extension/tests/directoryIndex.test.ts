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

  it('rejects GitHub-style repository file tables', () => {
    const html = `
      <html><head><title>deibhaid/aria2chrome</title></head><body>
        <table>
          <tr><th>Name</th><th>Last commit message</th><th>Last commit date</th></tr>
          <tr><td><a href="README.md">README.md</a></td><td>Update docs</td><td>2 days ago</td></tr>
          <tr><td><a href="manifest.json">manifest.json</a></td><td>Initial commit</td><td>1 week ago</td></tr>
        </table>
      </body></html>
    `;
    expect(
      detectDirectoryIndex(doc(html, 'https://github.com/deibhaid/aria2chrome/')),
    ).toBe(false);
  });

  it('rejects tables that only match loose "last" headers', () => {
    const html = `
      <html><body><table>
        <tr><th>Name</th><th>Last updated</th></tr>
        <tr><td><a href="/item">Item</a></td><td>Today</td></tr>
      </table></body></html>
    `;
    expect(detectDirectoryIndex(doc(html))).toBe(false);
  });

  it('rejects empty pages', () => {
    expect(detectDirectoryIndex(doc('<html><body><p>Hello</p></body></html>'))).toBe(false);
  });

  it('detects rainbowda.sh-style table listings from title and headers', () => {
    const html = `
      <html><head><title>Index of /movies/28 Years Later The Bone Temple (2026)/</title></head>
      <body><h1>Index of /movies/28 Years Later The Bone Temple (2026)/</h1>
      <table>
        <tr><th>File Name</th><th>File Size</th><th>Date</th></tr>
        <tr><td><a href="../">Parent directory/</a></td><td>-</td><td>-</td></tr>
        <tr><td><a href="movie.mkv">movie.mkv</a></td><td>6.6 GiB</td><td>2026-Apr-19</td></tr>
      </table></body></html>
    `;
    expect(
      detectDirectoryIndex(
        doc(html, 'https://downloads.rainbowda.sh/movies/28%20Years%20Later%20The%20Bone%20Temple%20%282026%29/'),
      ),
    ).toBe(true);
  });
});
