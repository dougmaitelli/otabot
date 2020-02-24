import Bot from "./Bot";
import TelegramBot from "node-telegram-bot-api";

const LABEL_COMMENT_MAP = {
  "corn|corn kernels|sweet corn": ["MILHOOOOOO!!!!!"],
  "cat|cats": ["Aff, foto de gato denovo!", "Chega de foto de gato!"],
  hamburger: ["Meu deus! Um Hamburguer ia cair bem!!!", "Manda um!"],
  "sushi|fish": ["Sushiiiiiii!!!", "Sacanagem isso ai...."],
  food: ["Opa! Comida!!!", "COMIDAAAAAA"],
  "drink|drinking": ["Sempre bebendo...", "Eita, denovo?"],
  "water|kayak": [
    "Queria eu estar curtindo a água, mas isso iria fritar meus circuitos..."
  ],
  male: ["Que homem..."]
};

class PhotoCommenter {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async commentPhoto(message: TelegramBot.Message, photoInfo): Promise<void> {
    const labels = photoInfo.labelAnnotations;

    let photoComment = null;
    for (let labelComment in LABEL_COMMENT_MAP) {
      const labelCommentParts = labelComment.split("|");

      for (let label of labels) {
        const description = label.description.toLowerCase();

        if (labelCommentParts.includes(description)) {
          const comments = LABEL_COMMENT_MAP[labelComment];

          photoComment = comments[Math.floor(Math.random() * comments.length)];
          break;
        }
      }

      if (photoComment) {
        break;
      }
    }

    if (photoComment) {
      return await this.bot.sendMessage(message.chat.id, photoComment, {
        reply_to_message_id: message.message_id
      });
    }

    const texts = photoInfo.textAnnotations;

    if (texts.length > 0) {
      const description = texts[0].description.toLowerCase();

      return await this.bot.processMessage(message, description);
    }
  }
}

export default PhotoCommenter;
