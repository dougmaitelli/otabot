import Bot from "./Bot";
import TelegramBot from "node-telegram-bot-api";

const ALLOWED_LABELS = {
  corn: ["corn kernels", "sweet corn"],
  cat: ["cats"],
  burger: ["hamburger"],
  sushi: ["fish"],
  food: [],
  drink: ["drinking"],
  water: ["kayak"],
  male: [],
  female: []
};

class PhotoCommenter {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async commentPhoto(message: TelegramBot.Message, photoInfo): Promise<void> {
    const labels = photoInfo.labelAnnotations;

    let photoComment = null;
    for (let allowedLabel in ALLOWED_LABELS) {
      const labelAliases = ALLOWED_LABELS[allowedLabel];

      for (let label of labels) {
        const description = label.description.toLowerCase();

        if (
          allowedLabel === description ||
          labelAliases.includes(description)
        ) {
          photoComment = await this.bot.dialogFlowHelper.getCommentForPhotoLabel(
            allowedLabel
          );
          break;
        }
      }

      if (photoComment) {
        break;
      }
    }

    if (photoComment) {
      return await this.bot.sendMessage(message.chat.id, photoComment);
    }

    const texts = photoInfo.textAnnotations;

    if (texts.length > 0) {
      const description = texts[0].description.toLowerCase();

      return await this.bot.processMessage(message, description);
    }
  }
}

export default PhotoCommenter;
