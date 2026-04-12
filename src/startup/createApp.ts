import { Client, GatewayIntentBits } from "discord.js";
import { loadEnv } from "../config/env";
import { logger } from "../config/logger";
import { prisma } from "../db/prisma";
import { createCommandRegistry } from "../commands/registry";
import { registerApplicationCommands } from "../commands/registerApplicationCommands";
import { createEventRegistry } from "../events/registry";
import { PrismaQuoteRepository } from "../repositories/prismaQuoteRepository";
import { QuoteService } from "../services/quoteService";
import { DailyQotdJob } from "../jobs/dailyQotdJob";
import { QotdSettingsStore } from "../config/qotdSettingsStore";

export function createApp(): { start: () => Promise<void> } {
  const env = loadEnv();
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  const quoteRepository = new PrismaQuoteRepository(prisma);
  const quoteService = new QuoteService(quoteRepository);
  const qotdSettingsStore = new QotdSettingsStore({
    qotdChannelId: env.QOTD_CHANNEL_ID,
    cronSchedule: env.CRON_SCHEDULE
  });
  const qotdJob = new DailyQotdJob(client, quoteService, env, logger, qotdSettingsStore);

  const commandRegistry = createCommandRegistry(quoteService, qotdJob);
  const eventRegistry = createEventRegistry({
    client,
    logger,
    env,
    commandRegistry,
    qotdJob
  });

  return {
    async start(): Promise<void> {
      eventRegistry.registerAll();

      try {
        const scope = await registerApplicationCommands(commandRegistry, env);
        logger.info({ scope }, "Slash commands registered on startup");
      } catch (error) {
        logger.warn({ error }, "Failed to register slash commands on startup");
      }

      await client.login(env.DISCORD_TOKEN);
    }
  };
}
