# QOTD Discord Bot (TypeScript)

A clean, modern Discord bot for managing quotes and posting a daily quote of the day.

## Stack

- Node.js + TypeScript
- discord.js v14 (slash commands)
- Prisma + SQLite
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

- `/quote add text:<quote> author:<optional>`
- `/quote random`
- `/qotd post`

## Quality Commands

- `npm run check:types`
- `npm run lint`
- `npm run test`
- `npm run build`# QOTD
