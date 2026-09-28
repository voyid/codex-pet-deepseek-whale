#!/usr/bin/env bash
# Install the DeepSeek Whale pet into Codex.
set -euo pipefail

dest="${CODEX_HOME:-$HOME/.codex}/pets/deepseek"
mkdir -p "$dest"
cp -f "$(dirname "$0")/pets/deepseek/"* "$dest/"

echo "Installed to $dest"
echo "Now open Codex -> Settings -> Pets and pick 'DeepSeek Whale'."
