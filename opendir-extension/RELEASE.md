# OpenDir 1.0.0 — Stable Release

**Author:** David W. Bryson  
**Type:** Chrome Manifest V3 extension (unpacked load)

OpenDir replaces bare Apache/nginx directory listings and enhances local `file://` folder browsing with search, filters, previews, and batch downloads.

## Install

1. Download **OpenDir-1.0.0.zip** from this release (or build from source).
2. Unzip and open `chrome://extensions`.
3. Enable **Developer mode** → **Load unpacked** → select the `dist/` folder inside the unzipped package.
4. For local folders, enable **Allow access to file URLs** on the OpenDir card.

## Build from source

```bash
cd opendir-extension
npm install
npm run build
```

Load the `dist/` folder inside the unzipped package as unpacked.

## Highlights

- Auto-inject on directory index pages (HTTP/HTTPS)
- List + grid views, search, filters, sortable columns
- Settings: theme, thumbnail toggles, multi-file download delay
- Batch download with staggered timing
- Image/video/audio preview modal
- Clean-room implementation — no upstream bundle code

## Storage keys

| Setting | Key | Default |
|---------|-----|---------|
| Theme | `opendir-theme` | `light` |
| View | `opendir-view` | `list` |
| Thumbnails | `opendir-thumbnails` | `{ images: false, videos: false }` |
| Download delay | `opendir-downloadDelayMs` | `1500` |
| Random gaps | `opendir-downloadRandom` | `true` |

## Requirements

- Google Chrome (Manifest V3)
- Node.js 18+ (build only)

## Legal

Personal tool. See `NOTICE.md`. Toolbar icons are placeholders — replace before any public store submission.
