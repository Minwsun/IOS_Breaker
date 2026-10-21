#!/usr/bin/env bash
# Restore the reviewed, pinned rules snapshot; no floating upstream downloads.
set -euo pipefail
cd -- "$(dirname -- "$0")"
exec "${PYTHON:-python3}" scripts/vendor_assets.py --group rules
