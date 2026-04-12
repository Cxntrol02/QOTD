import { EmbedBuilder } from "discord.js";
import type { QuoteEntity } from "../repositories/quoteRepository";

export function buildQuoteEmbed(quote: QuoteEntity): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x1f8b4c)
    .setTitle("Quote of the Day")
    .setDescription(`"${quote.text}"`)
    .setFooter({
      text: quote.author ? `- ${quote.author}` : "- Unknown"
    })
    .setTimestamp(quote.createdAt);
}
