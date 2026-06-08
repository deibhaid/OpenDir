# OpenDir 0.0.6

**Author:** David W. Bryson  
**Type:** Chrome Manifest V3 extension (unpacked load)

OpenDir replaces bare Apache/nginx directory listings and enhances local `file://` folder browsing with search, filters, previews, and batch downloads.

## Install

1. Download **OpenDir-0.0.6.zip** from this release (or build from source).
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

- Fixed false activation on GitHub/GitLab/Bitbucket repo pages
- Stricter open-directory detection for table-based listings
- Recursive subfolder search with infinity toggle
- Shift-click range selection in list view
- Breadcrumb shows root URL with `/` path separators
- Extension filter in the search bar — compact field with centered `*.*` / `*.ext` label
- Search, bulk-download actions, and view toggles on one stable toolbar row
- List + grid views, sortable columns, batch downloads, preview modal

## Versioning

When drafting a new release, bump the version automatically:

| Current | Next |
|---------|------|
| 0.0.5 | 0.0.6 |
| 0.0.9 | 0.1.0 |
| 0.9.9 | 1.0.0 |

```bash
cd opendir-extension
node scripts/bump-version.mjs
npm run build
node scripts/package-release.mjs
```

Then commit, push, and draft the GitHub release with `OpenDir-<version>.zip`.

## What's in 0.0.6

OpenDir was incorrectly treating GitHub repository file tables as open directory listings because any table with a Name column and a header containing "last" (e.g. "Last commit message") passed detection. This release tightens that logic:

- Listing columns must look like file metadata (`Last modified`, `Size`, `Description`)
- Tables with SCM headers (`commit`, `author`, `message`, etc.) are ignored
- `github.com`, `gitlab.com`, and `bitbucket.org` are excluded from auto-detection

Apache `<pre>` listings and nginx-style directory tables still activate as before.

## Previous releases

See [CHANGELOG.md](CHANGELOG.md) for full history.
