import { REST, Routes } from "discord.js";
import { loadEnv } from "../config/env";
import { prisma } from "../db/prisma";
import { PrismaQuoteRepository } from "../repositories/prismaQuoteRepository";
import { QuoteService } from "../services/quoteService";
import { DailyQotdJob } from "../jobs/dailyQotdJob";
import { createCommandRegistry } from "../commands/registry";
import { Client, GatewayIntentBits } from "discord.js";
import { logger } from "../config/logger";
import { QotdSettingsStore } from "../config/qotdSettingsStore";

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
  const body = [...registry.values()].map((command) => command.data.toJSON());

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

  if (env.DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), {
      body
    });
    console.log("Guild commands registered.");
    return;
  }

  await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body });
  console.log("Global commands registered.");
}

registerCommands().catch((error) => {
  console.error(error);
  process.exit(1);
});
