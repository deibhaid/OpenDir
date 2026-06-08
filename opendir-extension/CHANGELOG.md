# Changelog

All notable changes to OpenDir are documented here.

## [1.0.0] — 2026-06-07

First stable release. Clean-room Chrome MV3 extension by David W. Bryson.

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

### Docs

- `SPEC.md`, `NOTICE.md`, `QA.md`, `UI_LAYOUT_QA.md`, `SETTINGS_AND_DOWNLOAD_PROMPTS.md`

### Verified

- Build, typecheck, and 15 unit tests passing

[1.0.0]: https://github.com/deibhaid/OpenDir/releases/tag/v1.0.0
