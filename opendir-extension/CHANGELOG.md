# Changelog

All notable changes to OpenDir are documented here.

## [0.0.8] — 2026-06-07

### Fixed

- Image and video thumbnails now appear in list view (previously only grid view)
- Table listings with "File Size" columns parse size correctly (header no longer mistaken for name column)
- GiB/MiB/KiB size units parse correctly in directory tables

### Verified

- Build, typecheck, and 44 unit tests passing

[0.0.8]: https://github.com/deibhaid/OpenDir/releases/tag/v0.0.8

## [0.0.7] — 2026-06-09

### Changed

- Search field placeholder shortened to "Search"
- Browser tab title shows `OD: {current_dir}` (domain name at site root)

### Fixed

- Removed duplicate search clear button (native search control only)

### Verified

- Build, typecheck, and 40 unit tests passing

[0.0.7]: https://github.com/deibhaid/OpenDir/releases/tag/v0.0.7

## [0.0.6] — 2026-06-08

### Fixed

- OpenDir no longer auto-activates on GitHub, GitLab, or Bitbucket repository pages
- Directory table detection requires file-listing columns (e.g. Last modified, Size) instead of any header containing "last"

### Verified

- Build, typecheck, and 35 unit tests passing

[0.0.6]: https://github.com/deibhaid/OpenDir/releases/tag/v0.0.6

## [0.0.5] — 2026-06-08

### Added

- Shift-click range selection in list view (select a row, then shift-click another to check everything between)

### Changed

- Breadcrumb shows root URL with `/` separators and a trailing `/` on the current path
- Settings gear moved to the toolbar row, to the right of the grid/list toggles

### Fixed

- Shift-selected rows now show checkbox checkmarks reliably

### Verified

- Build, typecheck, and 29 unit tests passing

[0.0.5]: https://github.com/deibhaid/OpenDir/releases/tag/v0.0.5

## [0.0.4] — 2026-06-08

### Changed

- Extension filter field uses a 7-character minimum width with centered label text
- Search toolbar keeps grid/list toggles fixed on the right when bulk-download controls appear

### Verified

- Build, typecheck, and 26 unit tests passing

[0.0.4]: https://github.com/deibhaid/OpenDir/releases/tag/v0.0.4

## [0.0.3] — 2026-06-08

### Changed

- Compact extension filter dropdown in the search bar — width fits the selected `*.*` / `*.ext` label
- Search toolbar keeps selection actions and view toggles on one stable row (no vertical or horizontal jump)

### Fixed

- OpenDir injects only on open HTTP(S) directory listings (not arbitrary pages)
- Loader script runs as a classic IIFE (no module import error on inject)
- `manifest.json` version stays synced with `package.json` on every build

### Verified

- Build, typecheck, and 26 unit tests passing

[0.0.3]: https://github.com/deibhaid/OpenDir/releases/tag/v0.0.3

## [0.0.2] — 2026-06-08

### Added

- Extension filter dropdown at the end of the search field (`*.*` default, plus `*.ext` for each extension in the directory)

### Changed

- Removed filter-by-type button and category filter menu

### Fixed

- Settings gear button opens the dropdown panel (Radix ref forwarding, portal mount, z-index)

### Verified

- Build, typecheck, and 18 unit tests passing

[0.0.2]: https://github.com/deibhaid/OpenDir/releases/tag/v0.0.2

## [0.0.1] — 2026-06-08

Initial release. Clean-room Chrome MV3 extension by David W. Bryson.

### Added

- Auto-inject on HTTP(S) Apache/nginx directory index pages
- Manual inject via toolbar icon or **Alt+Shift+F**
- Directory listing parser (Apache `pre`, nginx tables, parent `../` detection)
- List and grid views with search, type filters, column sorting, infinite scroll
- Three-column settings panel (Theme | Thumbnails | Multi-file download)
- Batch file download with configurable delay and random spacing
- Preview modal for image, video, and audio files
- `file://` help page when file URL access is disabled
- Persistence via `chrome.storage.local` (`opendir-*` keys)

### UI

- Sticky list column headers (pinned above scroll area)
- Display names without redundant extensions in the Name column
- Custom file-type icons and unique OpenDir toolbar icon

### Fixed

- Full filenames from href when server truncates anchor text in directory listings
- List row layout when displaying long wrapped names (icon sizing)

### Docs

- `SPEC.md`, `NOTICE.md`, `QA.md`, `UI_LAYOUT_QA.md`, `SETTINGS_AND_DOWNLOAD_PROMPTS.md`

### Verified

- Build, typecheck, and 17 unit tests passing

[0.0.1]: https://github.com/deibhaid/OpenDir/releases/tag/v0.0.1
