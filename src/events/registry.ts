import { Events } from "discord.js";
import type { Client } from "discord.js";
import type { Logger } from "pino";
import { createReadyEvent } from "./readyEvent";
import { createInteractionCreateEvent } from "./interactionCreateEvent";
import type { AppEnv } from "../config/env";
import type { SlashCommand } from "../types/command";
import type { DailyQotdJob } from "../jobs/dailyQotdJob";

interface EventRegistryDeps {
  client: Client;
  logger: Logger;
  env: AppEnv;
  commandRegistry: Map<string, SlashCommand>;
  qotdJob: DailyQotdJob;
}

export function createEventRegistry(deps: EventRegistryDeps): { registerAll: () => void } {
  return {
    registerAll(): void {
      deps.client.once(Events.ClientReady, createReadyEvent(deps.client, deps.logger, deps.qotdJob));

      const [interactionEventName, interactionHandler] = createInteractionCreateEvent(
        deps.commandRegistry,
        deps.logger
      );
      deps.client.on(interactionEventName, interactionHandler);
    }
  };
}
