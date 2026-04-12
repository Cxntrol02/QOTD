import cron, { type ScheduledTask } from "node-cron";
import { ChannelType, type Client, type TextChannel } from "discord.js";
import type { QuoteService } from "../services/quoteService";
import type { AppEnv } from "../config/env";
import type { Logger } from "pino";
import { buildQuestionEmbed } from "../utils/quoteFormatter";
import { QotdSettingsStore, type QotdSettings } from "../config/qotdSettingsStore";

interface PostResult {
  ok: boolean;
  message: string;
}

export class DailyQotdJob {
  private task: ScheduledTask | null = null;
  private settings: QotdSettings;

  public constructor(
    private readonly client: Client,
    private readonly quoteService: QuoteService,
    private readonly env: AppEnv,
    private readonly logger: Logger,
    private readonly settingsStore: QotdSettingsStore
  ) {
    this.settings = {
      qotdChannelId: env.QOTD_CHANNEL_ID,
      cronSchedule: env.CRON_SCHEDULE
    };
  }

  public async start(): Promise<void> {
    if (this.task) {
      return;
    }

    this.settings = await this.settingsStore.load();
    this.scheduleTask();
    this.logger.info(
      {
        schedule: this.settings.cronSchedule,
        channelId: this.settings.qotdChannelId
      },
      "QOTD scheduler started"
    );
  }

  public async configureDailyPosting(channelId: string, cronSchedule: string): Promise<void> {
    if (!cron.validate(cronSchedule)) {
      throw new Error("Invalid schedule format.");
    }

    this.settings = { qotdChannelId: channelId, cronSchedule };
    await this.settingsStore.save(this.settings);
    this.reschedule();
  }

  private scheduleTask(): void {
    this.task = cron.schedule(this.settings.cronSchedule, async () => {
      const result = await this.postNow();
      if (!result.ok) {
        this.logger.warn({ reason: result.message }, "Scheduled QOTD posting failed");
      }
    });
  }

  private reschedule(): void {
    if (this.task) {
      this.task.stop();
      this.task.destroy();
      this.task = null;
    }

    this.scheduleTask();
  }

  public async postNow(): Promise<PostResult> {
    const question = await this.quoteService.getRandomQuote();
    if (!question) {
      return { ok: false, message: "No questions are available. Add one with `/question add`." };
    }

    const channel = await this.client.channels.fetch(this.settings.qotdChannelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return { ok: false, message: "Configured QOTD channel could not be found as a text channel." };
    }

    await (channel as TextChannel).send({ embeds: [buildQuestionEmbed(question)] });
    return { ok: true, message: "ok" };
  }
}
