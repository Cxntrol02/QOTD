import type { Client } from "discord.js";
import type { Logger } from "pino";
import type { DailyQotdJob } from "../jobs/dailyQotdJob";

export function createReadyEvent(client: Client, logger: Logger, qotdJob: DailyQotdJob): () => void {
  return () => {
    logger.info({ botTag: client.user?.tag }, "Discord bot is online");
    void qotdJob.start().catch((error) => {
      logger.error({ error }, "Failed to start QOTD scheduler");
    });
  };
}
