# OpenDir

**Author:** David W. Bryson

OpenDir is a personal Chrome Manifest V3 extension that replaces bare Apache/nginx directory index pages and enhances local `file://` folder browsing with search, filters, previews, and batch downloads.

The extension appears as **OpenDir** in Chrome (`chrome://extensions`). Source lives in this repository under `opendir-extension/`.

## Build

```bash
cd opendir-extension
npm install
npm run build
npm run typecheck
npm test
```

The build output is written to `dist/`.

## Load unpacked in Chrome

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `dist/` folder.
5. For local folders, enable **Allow access to file URLs** on the OpenDir card.

## Usage

- OpenDir auto-injects on HTTP(S) pages that look like directory indexes (for example, Apache "Index of" listings).
- Click the toolbar icon to inject manually on any allowed tab, including `file://` folders once file URL access is enabled.
- Press **Alt+Shift+F** to trigger the extension action.
- Use search, type filters, list/grid views, preview modal, and batch downloads from the injected UI.

## Manual test: batch downloads

1. Open a directory listing with multiple files.
2. Switch to list view and select several files with the row checkboxes.
3. Open settings and confirm download delay (default 1500 ms) and random duration (default on).
4. Click **Download selected** and verify downloads start immediately for the first file, then stagger according to the delay settings.

## Project docs

- `SPEC.md` — product specification
- `NOTICE.md` — legal / upstream disclaimer
- `QA.md` — acceptance checklist
- `CHANGELOG.md` — version history

## Releases

Stable releases are tagged `v0.1.6`, etc. See [GitHub Releases](https://github.com/deibhaid/OpenDir/releases) for packaged `dist/` zips.

Current version: **0.1.6**

## Development

```bash
npm run dev
```

Rebuild and reload the unpacked extension after changes.
