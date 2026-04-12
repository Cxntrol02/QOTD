import { EmbedBuilder } from "discord.js";
import type { QuoteEntity } from "../repositories/quoteRepository";

export function buildQuestionEmbed(question: QuoteEntity): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x1f8b4c)
    .setTitle("Question of the Day")
    .setDescription(question.text)
    .setFooter({
      text: question.author ? `Asked by: ${question.author}` : "Asked by: Unknown"
    })
    .setTimestamp(question.createdAt);
}
