import { REST, Routes } from "discord.js";
import type { AppEnv } from "../config/env";
import type { SlashCommand } from "../types/command";

export async function registerApplicationCommands(
  commandRegistry: Map<string, SlashCommand>,
  env: AppEnv
): Promise<"guild" | "global"> {
  const body = [...commandRegistry.values()].map((command) => command.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

  if (env.DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), {
      body
    });
    return "guild";
  }

  await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body });
  return "global";
}