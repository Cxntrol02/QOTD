#!/bin/sh
set -eu

echo "[deploy] Applying Prisma schema..."
npx prisma db push

if [ "${SEED_ON_DEPLOY:-false}" = "true" ]; then
  echo "[deploy] Seeding database..."
  node_modules/.bin/tsx prisma/seed.ts
fi

if [ "${REGISTER_COMMANDS_ON_DEPLOY:-true}" = "true" ]; then
  echo "[deploy] Registering slash commands..."
  node dist/scripts/deployCommands.js
fi

echo "[deploy] Starting bot..."
exec node dist/index.js
