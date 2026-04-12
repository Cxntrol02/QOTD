import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../types/command";
import type { DailyQotdJob } from "../jobs/dailyQotdJob";

export function createQotdCommand(job: DailyQotdJob): SlashCommand {
  return {
    data: new SlashCommandBuilder()
      .setName("qotd")
      .setDescription("Quote of the day actions")
      .addSubcommand((subcommand) =>
        subcommand.setName("post").setDescription("Post the QOTD to the configured channel now")
      ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand !== "post") {
        await interaction.reply({ content: "Unsupported subcommand.", ephemeral: true });
        return;
      }

      await interaction.deferReply({ ephemeral: true });
      const result = await job.postNow();

      if (!result.ok) {
        await interaction.editReply(result.message);
        return;
      }

      await interaction.editReply("QOTD posted successfully.");
    }
  };
}
