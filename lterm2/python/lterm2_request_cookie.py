#!/usr/bin/env python3
"""Print ITERM2_COOKIE and ITERM2_KEY for lTerm2 API access (development helper)."""

from __future__ import annotations

import os
import secrets
import sys


def main() -> int:
    name = sys.argv[1] if len(sys.argv) > 1 else "external-script"
    cookie = secrets.token_hex(16)
    key = f"{name}:{secrets.token_hex(8)}"
    # lTerm2 validates cookies issued in-process; for external scripts use
    # LTERM2_API_INSECURE=1 during development, or launch from lTerm2 Scripts menu.
    print(f"export ITERM2_COOKIE={cookie}")
    print(f"export ITERM2_KEY={key}")
    print(f"# Script name: {name}")
    if os.environ.get("LTERM2_API_INSECURE"):
        print("# LTERM2_API_INSECURE is set — cookie not required")
    else:
        print("# Note: register cookies via lTerm2 Scripts menu (Phase 2) or set LTERM2_API_INSECURE=1 for dev")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
