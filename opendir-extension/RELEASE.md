# OpenDir 0.0.2

**Author:** David W. Bryson  
**Type:** Chrome Manifest V3 extension (unpacked load)

OpenDir replaces bare Apache/nginx directory listings and enhances local `file://` folder browsing with search, filters, previews, and batch downloads.

## Install

1. Download **OpenDir-0.0.2.zip** from this release (or build from source).
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

- Extension filter dropdown in search bar (`*.*`, `*.zip`, etc.)
- Settings gear opens three-column panel (Theme | Thumbnails | Multi-file download)
- Full filenames when servers truncate directory link text
- List + grid views, search, sortable columns, batch downloads, preview modal

## Versioning

When drafting a new release, bump the version automatically:

| Current | Next |
|---------|------|
| 0.0.1 | 0.0.2 |
| 0.0.9 | 0.1.0 |
| 0.9.9 | 1.0.0 |

Each segment is single-digit (0–9). Increment patch; at patch 9 roll to minor; at minor 9 roll to major.

**Canonical version:** `opendir-extension/package.json`. `manifest.json` and `dist/manifest.json` are synced from it on every build so Chrome shows the same version as the GitHub release tag (`v0.0.2` → `"version": "0.0.2"`).

```bash
cd opendir-extension
node scripts/bump-version.mjs
npm run build
node scripts/package-release.mjs
```

Then draft the release with GitHub CLI — the agent runs this; do not ask the user to do it:

```bash
gh release create v<version> \
  --draft \
  --title "OpenDir <version>" \
  --target <branch-name> \
  --notes-file opendir-extension/RELEASE.md \
  ../release/OpenDir-<version>.zip
```

See `.cursor/rules/draft-release.mdc` for the full agent workflow (execute end-to-end; never hand off to the user).

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
