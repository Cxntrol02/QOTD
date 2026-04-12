import { Events, type Interaction } from "discord.js";
import type { Logger } from "pino";
import type { SlashCommand } from "../types/command";

export function createInteractionCreateEvent(
  commandRegistry: Map<string, SlashCommand>,
  logger: Logger
): [(typeof Events)["InteractionCreate"], (interaction: Interaction) => Promise<void>] {
  return [Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = commandRegistry.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ content: "Unknown command.", ephemeral: true });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error({ error, commandName: interaction.commandName }, "Command execution failed");
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: "Something went wrong while processing that command.",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "Something went wrong while processing that command.",
          ephemeral: true
        });
      }
    }
  }];
}
