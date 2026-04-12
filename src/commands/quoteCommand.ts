import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { SlashCommand } from "../types/command";
import { buildQuoteEmbed } from "../utils/quoteFormatter";
import type { QuoteService } from "../services/quoteService";

export function createQuoteCommand(quoteService: QuoteService): SlashCommand {
  return {
    data: new SlashCommandBuilder()
      .setName("quote")
      .setDescription("Manage and view quotes")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription("Add a new quote")
          .addStringOption((option) =>
            option
              .setName("text")
              .setDescription("Quote text")
              .setRequired(true)
              .setMaxLength(500)
          )
          .addStringOption((option) =>
            option.setName("author").setDescription("Quote author").setRequired(false).setMaxLength(100)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("random").setDescription("Get a random quote from the database")
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
          content: `Quote added (#${created.id}).`,
          ephemeral: true
        });
        return;
      }

      if (subcommand === "random") {
        const quote = await quoteService.getRandomQuote();
        if (!quote) {
          await interaction.reply({
            content: "No quotes found yet. Use `/quote add` first.",
            ephemeral: true
          });
          return;
        }

        await interaction.reply({ embeds: [buildQuoteEmbed(quote)] });
      }
    }
  };
}
