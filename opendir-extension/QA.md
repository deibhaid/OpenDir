# OpenDir QA Checklist

Use this checklist after loading `dist/` in `chrome://extensions`.

## 1. Injection trigger

- [ ] Auto-inject on HTTP(S) directory index without clicking toolbar icon
- [ ] Skip auto-inject when `openDirActive` already set (no double inject on refresh)
- [ ] Repeated hard refresh still auto-injects OpenDir on directory pages
- [ ] Toolbar icon toggles OpenDir off (reload native listing) and back on
- [ ] Manual inject via toolbar icon works on allowed tabs
- [ ] `file://` without file access opens help page
- [ ] `file://` with file access injects UI
- [ ] Alt+Shift+F triggers extension action

## 2. Injection mechanics

- [ ] Loader + CSS injected by service worker
- [ ] React app mounts full viewport after clearing original page DOM
- [ ] Loader ignores duplicate injection attempts on the same page load

## 3. Parsing

- [ ] Apache `pre` listings parsed with size/date metadata
- [ ] Table-based nginx/autoindex listings parsed
- [ ] Parent `../` detected and labeled correctly
- [ ] Self-links and duplicates excluded

## 4. Main UI layout

- [ ] Sticky header, selection bar area, scrollable file area, preview modal
- [ ] No summary stats row
- [ ] No separate sort dropdown in toolbar

## 5. Header

- [ ] Breadcrumb with Home link and current segment unlinked
- [ ] Settings dropdown with Theme / Thumbnails / Download columns
- [ ] Search with clear button
- [ ] Filter dropdown with all spec categories
- [ ] Grid/List toggle with correct titles

## 6. Filtering and search

- [ ] Search is case-insensitive on names
- [ ] Type filter keeps parent `../` visible
- [ ] Footer shows filtered count text

## 7. Sorting (list view)

- [ ] Sortable Name / Extension / Date Created / Size columns
- [ ] Default directions match spec
- [ ] Parent row pinned first regardless of sort

## 8. Selection and downloads

- [ ] Row checkboxes and select-all-visible work
- [ ] Selection bar shows count, Download selected, Clear
- [ ] Batch download skips directories
- [ ] First download immediate; later downloads respect delay/random settings
- [ ] Minimum delay 250 ms enforced

## 9. Grid view

- [ ] Responsive 2–6 column grid
- [ ] Cards show icon/thumbnail, name, ext, size, modified
- [ ] Image/video thumbnail toggles respected
- [ ] File type color coding visible

## 10. Preview modal

- [ ] Image, video, audio previews work
- [ ] Generic icon for other files
- [ ] Download, close, prev/next controls
- [ ] "index of total" subtitle when navigating multiple previewable items

## 11. Empty states

- [ ] Empty folder message
- [ ] No search/filter results message with hint

## 12. Persistence

- [ ] Theme, view, thumbnails, download settings, sort state persist across reloads
- [ ] Storage keys use `opendir-` prefix

## 13. Theme

- [ ] Light, dark, and system themes work
- [ ] System follows `prefers-color-scheme`

## 14. Infinite scroll

- [ ] Initial 50 items loaded
- [ ] Scroll loads more items

## 15. Manifest

- [ ] MV3, correct permissions/host permissions
- [ ] No `update_url`, analytics, or upstream author references

## 16. File URL help page

- [ ] Help page explains file URL access
- [ ] Button opens `chrome://extensions/?id=...`

## 17. Legal / polish

- [ ] NOTICE.md present
- [ ] Placeholder icons only
- [ ] No upstream minified bundle references in source

## Manual test URLs

- [ ] Public or local Apache/nginx directory index
- [ ] Local `file://` folder after enabling file URL access

## Selection bar layout

- [ ] Reserved `h-12` space remains stable when no items selected
