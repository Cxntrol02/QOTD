import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../types/command";
import type { DailyQotdJob } from "../jobs/dailyQotdJob";

function parseTimeToCron(time: string): string | null {
  const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }

  const hour = match[1];
  const minute = match[2];
  return `${minute} ${hour} * * *`;
}

export function createQotdCommand(job: DailyQotdJob): SlashCommand {
  return {
    data: new SlashCommandBuilder()
      .setName("qotd")
      .setDescription("Question of the day actions")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand((subcommand) =>
        subcommand.setName("post").setDescription("Post the QOTD to the configured channel now")
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("setup")
          .setDescription("Set the channel and daily time for automatic QOTD posts")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("Channel where the daily QOTD should be posted")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("time")
              .setDescription("Daily time in 24h format (HH:mm), server local time")
              .setRequired(true)
          )
      ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === "setup") {
        const channel = interaction.options.getChannel("channel", true);
        const time = interaction.options.getString("time", true).trim();
        const cronSchedule = parseTimeToCron(time);

        if (!cronSchedule) {
          await interaction.reply({
            content: "Invalid time format. Use 24h format like `09:30` or `21:00`.",
            ephemeral: true
          });
          return;
        }

        await job.configureDailyPosting(channel.id, cronSchedule);
        await interaction.reply({
          content: `Daily QOTD configured for ${channel} at ${time} (server local time).`,
          ephemeral: true
        });
        return;
      }

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
