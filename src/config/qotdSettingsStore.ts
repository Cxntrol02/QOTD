import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

export interface QotdSettings {
  qotdChannelId: string;
  cronSchedule: string;
}

const qotdSettingsSchema = z.object({
  qotdChannelId: z.string().min(1),
  cronSchedule: z.string().min(1)
});

export class QotdSettingsStore {
  private readonly filePath = path.resolve(process.cwd(), "qotd-settings.json");

  public constructor(private readonly defaults: QotdSettings) {}

  public async load(): Promise<QotdSettings> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = qotdSettingsSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        return this.defaults;
      }

      return parsed.data;
    } catch {
      return this.defaults;
    }
  }

  public async save(settings: QotdSettings): Promise<void> {
    const dirPath = path.dirname(this.filePath);
    await mkdir(dirPath, { recursive: true });
    await writeFile(this.filePath, JSON.stringify(settings, null, 2), "utf8");
  }
}