# OpenDir — Product Specification

**Author:** David W. Bryson  
**Version:** 0.0.7  
**Type:** Chrome Manifest V3 Extension

OpenDir replaces bare Apache/nginx directory index pages and enhances local `file://` directory browsing with search, filters, previews, and batch downloads.

**Target user:** Someone browsing HTTP(S) directory listings or local folders who wants search, filters, previews, and batch downloads.

---

## 1. Injection Trigger

### Toolbar icon click
- If `file://` and file access not allowed → open help page.
- Otherwise → inject UI into the active tab.

### Auto-inject on page load
- On HTTP/HTTPS page load (`tabs.onUpdated`, status `complete`): auto-inject when the page looks like a directory index **without** user clicking.
- Skip auto-inject if OpenDir is already active (`document.documentElement.dataset.openDirActive = "1"`).
- Track injected tab+URL in service worker; clear on tab close.
- Do not double-inject same tab+URL.

### Directory index detection heuristics
A page is treated as a directory index when **any** of:
1. `document.title` matches `/^index of(\s|\/|$)/i`
2. First `h1` text matches the same pattern
3. At least 2 links inside `pre a[href]`
4. Exactly 1 `pre` link whose href looks like parent (`..`)
5. Table-based index with link rows

---

## 2. Injection Mechanics

- Service worker injects a small loader script + CSS into the page (`allFrames: true` for script if needed; CSS on tab).
- Loader dynamically imports the main UI bundle from `chrome.runtime.getURL`.
- Main entry: set `openDirActive=1`, clear `document.body.innerHTML` and `document.head.innerHTML`, append `div#root`, mount React app full viewport height.

---

## 3. Parsing Directory Listings

Capture data **before** DOM is cleared.

### Link collection
- Sources: `pre a`, `table a`; fallback `document.links`.
- Skip: empty href, `?`, `#`, duplicates.
- Exclude self-link (current page URL without query).

### Item shape
```ts
{
  name: string;
  href: string;
  type: 'file' | 'directory';
  ext?: string;
  fileType?: string;
  size?: number | string;
  modified?: string;
  created?: string;
}
```

### Parent directory
- `href` is `..`, `../`, or parent path segment → display name `"../"`, type `directory`.
- Also detect parent when resolved pathname equals parent of current directory.

### File vs folder
- Trailing slash or no dot in name → directory.
- Else file with extension and `fileType` classification.

### fileType from extension
| Category | Extensions |
|----------|------------|
| images | bmp, gif, heic, ico, j2c, jp2, jpm, jpx, jxr, png, psd, svg, tif, webp, jpg, jpeg |
| videos | 3g2, 3gp, avif, avi, flv, m4v, mkv, mov, mp4, mpg, ogv, webm |
| audio | aac, ac3, amr, ape, flac, m4a, m4b, m4p, mp3, ogg, opus, spx, wav |

### Metadata extraction
- **Apache pre block:** find line containing link text; parse date like `DD-Mon-YYYY HH:MM` and size from same line.
- **HTML table rows:** map columns by header (name/size/modified/description); read cells.

### Display helpers
- **Size:** human-readable B/KB/MB/GB; handle raw bytes and Apache K/M/G suffix forms.
- **Date:** parse Apache, ISO, US slash formats; show `MM/DD/YY HH:MM:SS`.

---

## 4. Main UI Layout

- Full-height app: sticky header, optional selection bar, scrollable file area, preview modal overlay when item selected.
- **NO** summary stats row (no Folders/Files/Images count chips).
- **NO** separate "Sort by" toolbar dropdown; sorting only via list column headers.

---

## 5. Header

- **Breadcrumb** from URL path segments; first segment links to "Home"; current segment not linked.
- **Settings gear** dropdown with three side-by-side columns:
  - **Column A — Theme:** Light / Dark / System (radio, checkmark on selected)
  - **Column B — Thumbnails:** toggles Images, Videos (for grid view)
  - **Column C — Multi-file download:** Delay ms number input min 250 default 1500; Random duration checkbox default on
- **Search** input with clear button; placeholder `"Search files and folders..."`
- **Filter** dropdown: All Items, Folders, Files, Images, Videos, Audio, Documents, Code, Archives
  - Documents: pdf, doc, docx, txt, md
  - Code: js, ts, jsx, tsx, py, java, cpp, c, go, rs, rb, php
  - Archives: zip, rar, 7z, tar, gz, bz2
- **View toggle:** Grid view / List view (default List)
- **Keyboard shortcut:** Alt+Shift+F opens extension action (`manifest commands`)

---

## 6. Filtering and Search

- Search filters by item name (case-insensitive).
- Type filter applies to files; parent `"../"` always stays visible.
- Footer text uses **filtered** visible count: `"Showing 12 items"` or `"Showing all 12 items"`.

---

## 7. Sorting (List View)

- Columns: checkbox | Name | Extension | Date Created | Size
- Click column toggles asc/desc; default name asc; ext asc; date/size desc on first click.
- Sort key date uses `created || modified`.
- Parent `"../"` always pinned first row regardless of sort.

---

## 8. Selection and Downloads

- List rows: checkbox multiselect; header checkbox select all visible.
- Selection bar (fixed height `h-12`): `"N selected"`, Download selected, Clear. Hidden when none selected.
- Batch download: for each selected file, programmatic `<a download>` click.
- Delay between downloads:
  - Random on: each gap random between 250ms and `delayMs`
  - Random off: fixed `delayMs`
  - First file immediate
- Min `delayMs`: 250

---

## 9. Grid View

- Responsive grid 2–6 columns.
- Cards with icon/thumbnail area, name link, ext, size, modified.
- Optional image thumbnails when setting on; optional video thumbnail (`video` element metadata preload) when setting on.
- File type color coding (folder blue, image green, video purple, audio orange, etc.).

---

## 10. Preview Modal

- Large dialog: image preview, video with controls autoplay, audio with controls, or generic file icon.
- Header: name, ext badge, size, `"index of total"` when multiple previewable siblings.
- Download button, close button, prev/next when multiple items in current filtered set.

---

## 11. Empty States

- No items: `"This folder is empty"`
- Search/filter no match: `"No results found"` with hint to adjust search/filter

---

## 12. Persistence (`chrome.storage.local`)

| Key | Type | Default |
|-----|------|---------|
| `opendir-theme` | `light\|dark\|system` | system |
| `opendir-view` | `grid\|list` | list |
| `opendir-thumbnails` | `{ images: bool, videos: bool }` | images: true, videos: false |
| `opendir-downloadDelayMs` | number | 1500 |
| `opendir-downloadRandom` | boolean | true |
| `opendir-sortColumn` | string | name |
| `opendir-sortDir` | `asc\|desc` | asc |

---

## 13. Theme

- Light/dark CSS variables; system follows `prefers-color-scheme`.
- Apply `dark` class on `documentElement` when needed.

---

## 14. Infinite Scroll

- Load 50 items at a time from filtered sorted list; scroll container loads more.

---

## 15. Manifest

- name: OpenDir, author: David W. Bryson, version: 0.0.7
- permissions: `activeTab`, `scripting`, `storage`
- host_permissions: `http://*/*`, `https://*/*`
- background service worker module
- web_accessible_resources for assets on http/https/file
- **NO** key, **NO** update_url, **NO** analytics

---

## 16. File URL Help Page

Static page explaining enable "Allow access to file URLs" with button opening `chrome://extensions/?id=EXTENSION_ID`.

---

## 17. Legal

- `NOTICE.md`: personal fork, not affiliated with upstream File Explorer, MIT/ISC deps listed, icons are placeholders.
