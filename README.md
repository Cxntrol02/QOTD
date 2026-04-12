# QOTD Discord Bot (TypeScript)

A clean, modern Discord bot for managing questions and posting a daily question of the day.

## Stack

- Node.js + TypeScript
- discord.js v14 (slash commands)
- Prisma + PostgreSQL
- node-cron scheduler
- pino logging
- Vitest + ESLint + Prettier

## Project Structure

```
qotd/
  prisma/
    schema.prisma
    seed.ts
  src/
    commands/
    config/
    db/
    events/
    jobs/
    repositories/
    scripts/
    services/
    startup/
    types/
    utils/
    index.ts
  tests/
    quoteService.test.ts
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env file and fill values:

   ```bash
   copy .env.example .env
   ```

3. Create database and Prisma client:

   ```bash
   npm run db:migrate -- --name init
   npm run db:generate
   npm run seed
   ```

4. Register slash commands:

   ```bash
   npm run bot:register
   ```

5. Run in development:

   ```bash
   npm run dev
   ```

## Commands

- `/question add text:<question> author:<optional>`
- `/question random`
- `/qotd post`
- `/qotd setup channel:<#channel> time:<HH:mm>`

`/qotd setup` saves your schedule in `qotd-settings.json`, so your configured channel/time persists across restarts.

## Quality Commands

- `npm run check:types`
- `npm run lint`
- `npm run test`
- `npm run build`

## Deploy Notes

For container deploys (Dokploy), these optional env vars control startup behavior:

- `DB_PUSH_ON_DEPLOY` (default `true`): run `prisma db push` during startup.
- `DB_PUSH_MAX_RETRIES` (default `3`): number of retries when DB is unreachable.
- `DB_PUSH_RETRY_DELAY_SECONDS` (default `5`): delay between retries.
- `REQUIRE_DB_ON_STARTUP` (default `false`): if `true`, container exits when schema apply fails.

Recommended for unstable/external DB links:

- Set `REQUIRE_DB_ON_STARTUP=false` so the bot can still boot and reconnect behavior can be observed in logs.
