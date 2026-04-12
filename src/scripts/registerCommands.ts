import { loadEnv } from "../config/env";
import { prisma } from "../db/prisma";
import { PrismaQuoteRepository } from "../repositories/prismaQuoteRepository";
import { QuoteService } from "../services/quoteService";
import { DailyQotdJob } from "../jobs/dailyQotdJob";
import { createCommandRegistry } from "../commands/registry";
import { Client, GatewayIntentBits } from "discord.js";
import { logger } from "../config/logger";
import { QotdSettingsStore } from "../config/qotdSettingsStore";
import { registerApplicationCommands } from "../commands/registerApplicationCommands";

async function registerCommands(): Promise<void> {
  const env = loadEnv();
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const quoteRepo = new PrismaQuoteRepository(prisma);
  const quoteService = new QuoteService(quoteRepo);
  const qotdSettingsStore = new QotdSettingsStore({
    qotdChannelId: env.QOTD_CHANNEL_ID,
    cronSchedule: env.CRON_SCHEDULE
  });
  const qotdJob = new DailyQotdJob(client, quoteService, env, logger, qotdSettingsStore);
  const registry = createCommandRegistry(quoteService, qotdJob);
  const scope = await registerApplicationCommands(registry, env);
  console.log(`${scope === "guild" ? "Guild" : "Global"} commands registered.`);
}

registerCommands().catch((error) => {
  console.error(error);
  process.exit(1);
});
