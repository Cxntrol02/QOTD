import cron, { type ScheduledTask } from "node-cron";
import { ChannelType, type Client, type TextChannel } from "discord.js";
import type { QuoteService } from "../services/quoteService";
import type { AppEnv } from "../config/env";
import type { Logger } from "pino";
import { buildQuoteEmbed } from "../utils/quoteFormatter";

interface PostResult {
  ok: boolean;
  message: string;
}

export class DailyQotdJob {
  private task: ScheduledTask | null = null;

  public constructor(
    private readonly client: Client,
    private readonly quoteService: QuoteService,
    private readonly env: AppEnv,
    private readonly logger: Logger
  ) {}

  public start(): void {
    if (this.task) {
      return;
    }

    this.task = cron.schedule(this.env.CRON_SCHEDULE, async () => {
      const result = await this.postNow();
      if (!result.ok) {
        this.logger.warn({ reason: result.message }, "Scheduled QOTD posting failed");
      }
    });

    this.logger.info({ schedule: this.env.CRON_SCHEDULE }, "QOTD scheduler started");
  }

  public async postNow(): Promise<PostResult> {
    const quote = await this.quoteService.getRandomQuote();
    if (!quote) {
      return { ok: false, message: "No quotes are available. Add one with `/quote add`." };
    }

    const channel = await this.client.channels.fetch(this.env.QOTD_CHANNEL_ID);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return { ok: false, message: "Configured QOTD channel could not be found as a text channel." };
    }

    await (channel as TextChannel).send({ embeds: [buildQuoteEmbed(quote)] });
    return { ok: true, message: "ok" };
  }
}
