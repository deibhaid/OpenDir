# OpenDir 0.1.7

**Author:** David W. Bryson  
**Type:** Chrome Manifest V3 extension (unpacked load)

OpenDir replaces bare Apache/nginx directory listings and enhances local `file://` folder browsing with search, filters, previews, and batch downloads.

## Install

1. Download **OpenDir-0.1.7.zip** from this release (or build from source).
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

- Tab title shows `OD: current_dir` (domain at site root, e.g. `OD: example.com`)
- Search placeholder simplified to "Search"
- Fixed false activation on GitHub/GitLab/Bitbucket repo pages
- Recursive subfolder search with infinity toggle
- Shift-click range selection in list view
- Breadcrumb shows root URL with `/` path separators
- Extension filter in the search bar — compact field with centered `*.*` / `*.ext` label
- List + grid views, sortable columns, batch downloads, preview modal

## What's in 0.0.8

- **List view thumbnails** — image and video thumbnail settings now apply in list view (not only grid)
- **Table size parsing** — fixes "File Size" columns and GiB/MiB/KiB units on directory servers like rainbowda.sh

## What's in 0.0.7

- **Tab title** — `OD: jazz` for `/music/jazz/`, `OD: example.com` at site root
- **Search UI** — shorter placeholder; removed redundant custom clear button
- **Detection fix (from 0.0.6)** — no longer activates on GitHub-style repo file tables

## Previous releases

See [CHANGELOG.md](CHANGELOG.md) for full history.
