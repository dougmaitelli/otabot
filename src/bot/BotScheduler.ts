import { CronJob } from "cron";
import Constants from "../Constants";
import YoutubeHelper from "../helper/YoutubeHelper";
import Bot from "./Bot";

const CHECK_INTERVAL_MINUTES = 30;

class BotScheduler {
  bot: Bot;
  youtubeHelper: YoutubeHelper;

  videoReminderJob: CronJob;

  constructor(bot: Bot, youtubeHelper: YoutubeHelper) {
    this.bot = bot;
    this.youtubeHelper = youtubeHelper;

    this.videoReminderJob = new CronJob(
      `0 */${CHECK_INTERVAL_MINUTES} * * * *`,
      async () => {
        const lastVideo = await youtubeHelper.getLatestVideo();

        const minutesSinceLastVideo =
          (new Date().getTime() - lastVideo.publishedAt.getTime()) / 1000 / 60;

        if (minutesSinceLastVideo < CHECK_INTERVAL_MINUTES) {
          await this.bot.sendMessage(
            Constants.GROUP_CHAT_ID,
            `Passando pra lembrar que tem vídeo novo no canal!\n${lastVideo.shortURL}`
          );
        }
      },
      null,
      false,
      "America/Sao_Paulo"
    );
    this.videoReminderJob.start();
  }
}

export default BotScheduler;
