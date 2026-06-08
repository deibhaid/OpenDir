# Changelog

All notable changes to OpenDir are documented here.

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
