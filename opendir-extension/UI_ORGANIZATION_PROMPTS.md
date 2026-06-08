# OpenDir — UI Organization

This document describes how the OpenDir content-script UI is organized. Use alongside `SPEC.md` and `CLEAN_ROOM_PROMPTS.md`.

## Component map

| Region | Component | Responsibility |
|--------|-----------|----------------|
| AppShell | `App.tsx` | `flex flex-col h-full`; omits stats row |
| AppHeader row 1 | `AppHeader.tsx` | Breadcrumb + Settings dropdown |
| AppHeader row 2 | `AppHeader.tsx` | Search + Filter + Grid/List toggles |
| SelectionBar | `SelectionBar.tsx` | `h-12` reserved; bulk download when selection |
| FileBrowser | `FileBrowser.tsx` | Infinite scroll; list table or grid |
| ListView | `ListView.tsx` | Column sort only; zebra + selected row styles |
| GridView | `GridView.tsx` | Cards; preview vs navigate on click |
| PreviewModal | `PreviewModal.tsx` | Media preview + carousel + keyboard |
| Settings | `SettingsDropdown.tsx` | 3 columns side-by-side |

## Deliberate omissions

- No summary stats row
- No separate Sort by toolbar dropdown
- No analytics, donation, or upgrade UI

## Defaults

- View: list
- Theme: light (System option still available)

## Acceptance

See `UI_LAYOUT_QA.md` for the visual/layout checklist.
