import type { SlashCommand } from "../types/command";
import { createQotdCommand } from "./qotdCommand";
import { createQuoteCommand } from "./quoteCommand";
import type { QuoteService } from "../services/quoteService";
import type { DailyQotdJob } from "../jobs/dailyQotdJob";

export function createCommandRegistry(
  quoteService: QuoteService,
  qotdJob: DailyQotdJob
): Map<string, SlashCommand> {
  const commands: SlashCommand[] = [createQuoteCommand(quoteService), createQotdCommand(qotdJob)];
  return new Map(commands.map((command) => [command.data.name, command]));
}
