# OpenDir

**Author:** David W. Bryson

OpenDir is a Chrome Manifest V3 extension that replaces bare Apache/nginx directory index pages and enhances local `file://` folder browsing with search, filters, previews, and batch downloads.

## Quick start

```bash
cd opendir-extension
npm install
npm run build
```

Load `opendir-extension/dist/` in Chrome via **Load unpacked** (`chrome://extensions`).

See [`opendir-extension/README.md`](opendir-extension/README.md) for full documentation.

Repository: https://github.com/deibhaid/OpenDir

## Releases

**Latest release:** [v0.0.2](https://github.com/deibhaid/OpenDir/releases/tag/v0.0.2)

Download the release zip or build from source. The extension displays as **OpenDir** in Chrome.

## Repository layout

| Path | Purpose |
|------|---------|
| `opendir-extension/` | OpenDir source, build, and docs |
| `opendir-extension/dist/` | Loadable unpacked extension (after `npm run build`) |
| `opendir-extension/SPEC.md` | Product specification |
