import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../types/command";
import { buildQuestionEmbed } from "../utils/quoteFormatter";
import type { QuoteService } from "../services/quoteService";

export function createQuoteCommand(quoteService: QuoteService): SlashCommand {
  return {
    data: new SlashCommandBuilder()
      .setName("question")
      .setDescription("Manage and view questions")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription("Add a new question")
          .addStringOption((option) =>
            option
              .setName("text")
              .setDescription("Question text")
              .setRequired(true)
              .setMaxLength(500)
          )
          .addStringOption((option) =>
            option
              .setName("author")
              .setDescription("Question author")
              .setRequired(false)
              .setMaxLength(100)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("random").setDescription("Get a random question from the database")
      ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === "add") {
        const text = interaction.options.getString("text", true);
        const author = interaction.options.getString("author") ?? undefined;
        const created = await quoteService.addQuote({
          text,
          author,
          addedById: interaction.user.id
        });

        await interaction.reply({
          content: `Question added (#${created.id}).`,
          ephemeral: true
        });
        return;
      }

      if (subcommand === "random") {
        const question = await quoteService.getRandomQuote();
        if (!question) {
          await interaction.reply({
            content: "No questions found yet. Use `/question add` first.",
            ephemeral: true
          });
          return;
        }

        await interaction.reply({ embeds: [buildQuestionEmbed(question)] });
      }
    }
  };
}
