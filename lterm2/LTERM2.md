# lTerm2

**lTerm2** is a WezTerm-based terminal emulator fork aimed at **iTerm2 feature parity on Linux**, with first-class support for the official **`iterm2` Python package**.

## What works today (Phase 1)

- iTerm2-compatible **protobuf/WebSocket API** on a Unix socket
- Core RPCs: `ListSessions`, `SendText`, `SplitPane`, `CreateTab`, `Activate`, `Focus`
- Session IDs: `w{window}t{tab}p{pane}` (e.g. `w0t0p3`)
- API enabled by default; disable with `LTERM2_DISABLE_PYTHON_API=1`

## Socket path

```
~/.local/share/wezterm/lterm2/private/socket
```

(Uses WezTerm's XDG data directory via `config::DATA_DIR`.)

## Enable + run Python scripts

```bash
# 1. Build lTerm2 (requires Rust nightly — matches upstream WezTerm)
cd lterm2
rustup toolchain install nightly
cargo +nightly build --release -p wezterm-gui

# 2. Install the official iTerm2 Python client
pip install iterm2

# 3. Bootstrap Linux socket/auth (before importing iterm2)
export PYTHONPATH="$PWD/python:$PYTHONPATH"

# 4. Get a cookie for external scripts
python python/lterm2_request_cookie.py myscript.py

# 5. Run your existing iTerm2 script
ITERM2_COOKIE=... python myscript.py
```

Or for development only:

```bash
export LTERM2_API_INSECURE=1   # skip cookie auth
```

## Architecture

```
import iterm2  →  WebSocket/protobuf  →  lterm2-api crate  →  mux (WezTerm)
```

The `lterm2-api` crate is a clean-room implementation of iTerm2's wire protocol; it does not embed iTerm2 GPL source code.

## Roadmap (iTerm2 features)

| Feature | Status |
|---------|--------|
| Python API (core RPCs) | **Phase 1 — implemented** |
| RPC registration / daemons | Phase 2 |
| Notifications (screen update, focus) | Phase 2 |
| Triggers | Phase 3 |
| Profiles + auto-switching | Phase 3 |
| Scripts menu / REPL / console UI | Phase 2 |
| Native tmux `-CC` | Phase 4 / alternative: WezTerm mux |
| Instant replay | Phase 4 |
| Hotkey window | Phase 3 |

See [docs/ITerm2-Parity.md](docs/ITerm2-Parity.md) for the full matrix.

## License

WezTerm components: **MIT** (Wez Furlong).  
lTerm2 additions: **MIT**.  
Use the `iterm2` PyPI package (GPL-2.0) only as an external Python dependency.
