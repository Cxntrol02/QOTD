import { createApp } from "./startup/createApp";

async function main(): Promise<void> {
  const app = createApp();
  await app.start();
}

main().catch((error) => {
  console.error("Fatal startup error", error);
  process.exit(1);
});
