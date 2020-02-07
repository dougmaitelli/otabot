import Bot from "./Bot";
import TelegramBot = require("node-telegram-bot-api");

const labelCommentMap = {
  "corn|corn kernels|sweet corn": "MILHOOOOOO!!!!!",
  "cat|cats": "Aff, foto de gato denovo!",
  hamburger: "Meu deus! Um Hamburguer ia cair bem!!!",
  sushi: "Sushiiiiiii!!!",
  food: "Opa! Comida!!!",
  "drink|drinking": "Sempre bebendo...",
  "kayak|water":
    "Queria eu estar curtindo a água, mas isso iria fritar meus circuitos...",
  male: "Que homem...",
  "female": "Olá gatinha...",
  "people|face": "Quem é esse feio?"
};

class PhotoCommenter {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async commentPhoto(message: TelegramBot.Message, photoInfo): Promise<void> {
    const labels = photoInfo.labelAnnotations;

    let photoComment = null;
    for (let labelComment in labelCommentMap) {
      const labelCommentParts = labelComment.split("|");

      for (let label of labels) {
        const description = label.description.toLowerCase();

        if (labelCommentParts.includes(description)) {
          photoComment = labelCommentMap[labelComment];
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
