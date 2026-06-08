# OpenDir — Settings and Multi-Download

David W. Bryson's settings layout and batch download behavior for OpenDir.

## Settings panel

**Location:** Header row 1 only — gear icon on the right (outline, icon size, title "Settings").

**Layout:** Single dropdown with three side-by-side columns:

| Column | Controls | Storage key | Default |
|--------|----------|-------------|---------|
| Theme | Light / Dark / System (radio + checkmark) | `opendir-theme` | `light` |
| Thumbnails | Images, Videos (checkboxes) | `opendir-thumbnails` | both `false` |
| Multi-file download | Delay (ms), Random duration | `opendir-downloadDelayMs`, `opendir-downloadRandom` | `1500`, `true` |

Changes persist immediately to `chrome.storage.local` (no Save button).

## Batch download

1. User selects files via list checkboxes
2. Selection bar shows `N selected` + **Download selected** + **Clear**
3. `downloadSelected()` filters to `type === "file"` (skips directories and `../`)
4. First file downloads immediately; subsequent files use cumulative delays:
   - **Fixed:** gap = `max(250, downloadDelayMs)`
   - **Random:** gap = `250 + random * (max(250, D) - 250)`

Single-file downloads (grid hover button, preview modal) use `triggerAnchorDownload()` with no delay.

## Components

- `SettingsDropdown.tsx` — three-column panel
- `ThemeProvider.tsx` / `useTheme()` — light/dark/system classes on `documentElement`
- `download/batchDownload.ts` — batch timing and anchor download helper
- `SelectionBar.tsx` — bulk download UI

See `UI_LAYOUT_QA.md` and `QA.md` for acceptance checklists.
