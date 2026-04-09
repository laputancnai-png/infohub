#!/bin/bash
# Deploy infohub to PROD server
# Usage: ./scripts/deploy.sh
# Requires: SSH access to root@47.250.134.90

set -e

PROD="root@47.250.134.90"
APP_DIR="/opt/infohub"

echo "→ Deploying to PROD..."

ssh "$PROD" "
  set -e
  cd $APP_DIR
  git fetch origin
  git reset --hard origin/master
  npm install --omit=dev
  npm run build
  systemctl restart infohub
  sleep 3
  systemctl is-active infohub
"

echo "✓ Deploy complete → https://infohub.36techsolutions.com"
