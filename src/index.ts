import fs from "fs";
import Bot from "./bot/Bot";

const BOT_NAME = "otaviano_bot";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "gcp.json";

fs.writeFileSync(
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  process.env.GCP_CRED
);

new Bot(BOT_NAME);
