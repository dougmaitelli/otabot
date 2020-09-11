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
      "0 1 20 * * *",
      async () => {
        const lastVideo = await youtubeHelper.getLatestVideo();
        await this.bot.sendMessage(
          Constants.GROUP_CHAT_ID,
          `Passando pra lembrar que tem vídeo novo no canal!\n${lastVideo.shortURL}`
        );
      },
      null,
      false,
      "America/Sao_Paulo"
    );
    this.videoReminderJob.start();
  }
}

export default BotScheduler;
