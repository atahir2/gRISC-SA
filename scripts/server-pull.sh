#!/usr/bin/env bash
# Safe pull on Linux/macOS deploy machines.
# Removes local .next before pull so Git never conflicts with build output.
# Usage: ./scripts/server-pull.sh [branch]
#   or:  npm run server:update -- main

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${1:-main}"

echo "==> Removing local .next (recreated by npm run build; must not block git pull)"
rm -rf .next

echo "==> Pulling origin/${BRANCH}..."
git fetch origin
if git pull --ff-only "origin" "$BRANCH"; then
  echo "==> Pull OK."
else
  echo "==> Fast-forward pull failed. If having no local commits to keep, run:"
  echo "    git reset --hard origin/${BRANCH}"
  echo "    Then: npm ci && npm run build"
  exit 1
fi

echo "==> Dependencies + production build"
npm ci
npm run build

echo "==> Done. Restart app process (pm2/systemd/docker) if needed."
