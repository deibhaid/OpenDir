"""
Linux bootstrap for the official `iterm2` Python package against lTerm2.

Usage (must run before `import iterm2`):

    import lterm2_bootstrap  # noqa: F401
    import iterm2
"""

from __future__ import annotations

import os
from pathlib import Path


def _socket_path() -> str:
    override = os.environ.get("LTERM2_SOCKET")
    if override:
        return override
    data = os.environ.get("XDG_DATA_HOME")
    if not data:
        data = str(Path.home() / ".local" / "share")
    return str(Path(data) / "wezterm" / "lterm2" / "private" / "socket")


def _patch_iterm2_connection() -> None:
    try:
        import iterm2.connection as conn
    except ImportError:
        return

    def _unix_domain_socket_path(_self):
        return _socket_path()

    def authenticate(_launch_if_needed=False, _myname=None):
        # Cookie must be set via lterm2_request_cookie.py or Scripts menu.
        return bool(os.environ.get("ITERM2_COOKIE"))

    conn.Connection._unix_domain_socket_path = _unix_domain_socket_path  # type: ignore[method-assign]
    if hasattr(conn, "auth"):
        conn.auth.authenticate = authenticate  # type: ignore[attr-defined]


_patch_iterm2_connection()
