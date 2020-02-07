import { CronJob } from "cron";
import Constants from "../Constants";
import YoutubeHelper from "../helper/YoutubeHelper";
import Bot from "./Bot";

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
          Constants.GROUP_CHAT_ID,
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
