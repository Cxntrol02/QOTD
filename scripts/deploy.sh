#!/bin/sh
set -eu

DB_PUSH_ON_DEPLOY="${DB_PUSH_ON_DEPLOY:-true}"
DB_PUSH_MAX_RETRIES="${DB_PUSH_MAX_RETRIES:-3}"
DB_PUSH_RETRY_DELAY_SECONDS="${DB_PUSH_RETRY_DELAY_SECONDS:-5}"
REQUIRE_DB_ON_STARTUP="${REQUIRE_DB_ON_STARTUP:-false}"

if [ "$DB_PUSH_ON_DEPLOY" = "true" ]; then
  echo "[deploy] Applying Prisma schema..."

  attempt=1
  while true; do
    if npx prisma db push; then
      break
    fi

    if [ "$attempt" -ge "$DB_PUSH_MAX_RETRIES" ]; then
      if [ "$REQUIRE_DB_ON_STARTUP" = "true" ]; then
        echo "[deploy] Prisma schema apply failed after ${attempt} attempt(s). Exiting because REQUIRE_DB_ON_STARTUP=true."
        exit 1
      fi

      echo "[deploy] Prisma schema apply failed after ${attempt} attempt(s), continuing startup because REQUIRE_DB_ON_STARTUP=false."
      break
    fi

    echo "[deploy] Prisma schema apply failed (attempt ${attempt}/${DB_PUSH_MAX_RETRIES}). Retrying in ${DB_PUSH_RETRY_DELAY_SECONDS}s..."
    attempt=$((attempt + 1))
    sleep "$DB_PUSH_RETRY_DELAY_SECONDS"
  done
else
  echo "[deploy] Skipping Prisma schema apply because DB_PUSH_ON_DEPLOY=false"
fi

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
