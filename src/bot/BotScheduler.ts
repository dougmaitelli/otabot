import { CronJob } from "cron";
import YoutubeHelper from "../helper/YoutubeHelper";
import Bot from "./Bot";

const GROUP_CHAT_ID = -1001463888212;

class BotScheduler {
  bot: Bot;
  youtubeHelper: YoutubeHelper;

  videoReminderJob: CronJob;

  constructor(bot: Bot, youtubeHelper: YoutubeHelper) {
    this.bot = bot;
    this.youtubeHelper = youtubeHelper;

    this.videoReminderJob = new CronJob(
      "0 1 15 * * *",
      async () => {
        const lastVideoLink = await youtubeHelper.getLastVideoLink();
        await this.bot.sendMessage(
          GROUP_CHAT_ID,
          `Passando pra lembrar que tem vídeo novo no canal!\n${lastVideoLink}`
        );
      },
      null,
      false,
      "America/Los_Angeles"
    );
    this.videoReminderJob.start();
  }
}

export default BotScheduler;
