# lTerm2 fork

This repository contains an **lTerm2** fork of [WezTerm](https://github.com/wez/wezterm) under [`lterm2/`](lterm2/).

lTerm2 adds an **iTerm2-compatible Python API server** so existing `import iterm2` scripts can target Linux/GNOME.

## Quick start

```bash
cd lterm2
rustup toolchain install nightly
cargo build --release -p wezterm-gui
```

Full documentation: [lterm2/LTERM2.md](lterm2/LTERM2.md)

## Branch

Development branch: `cursor/lterm2-fork-fcba`
