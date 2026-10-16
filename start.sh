#!/usr/bin/env bash
set -euo pipefail

game_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
port="${PORT:-38471}"

echo "九州行军录已就绪：http://localhost:${port}"
exec python3 -m http.server "$port" --bind 0.0.0.0 --directory "$game_dir"
