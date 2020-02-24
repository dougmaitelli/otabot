import emoji from "node-emoji";
import TelegramBot from "node-telegram-bot-api";
import Constants from "../Constants";
import DialogFlowHelper from "../helper/DialogFlowHelper";
import VisionHelper from "../helper/VisionHelper";
import YoutubeHelper from "../helper/YoutubeHelper";
import BotScheduler from "./BotScheduler";
import PhotoCommenter from "./PhotoCommenter";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const WELCOME_MESSAGE = "Bem vindos gurizada!";

const bypassMessages: RegExp[] = [
  /^um abraço!*$/,
  /^um beijo!*$/,
  /^(e )?um queijo!*$/,
  /^vivendo mundo afora!*$/,
  /^v+a+i+!*$/,
  /e tudo mais$/
];

class Bot {
  bot: TelegramBot;
  botName: string;

  botScheduler: BotScheduler;
  photoCommenter: PhotoCommenter;

  dialogFlowHelper: DialogFlowHelper;
  visionHelper: VisionHelper;
  youtubeHelper: YoutubeHelper;

  constructor(botName: string) {
    this.bot = new TelegramBot(TELEGRAM_TOKEN, {
      webHook: {
        port: parseInt(process.env.PORT)
      }
    });
    this.botName = botName;

    this.photoCommenter = new PhotoCommenter(this);

    this.dialogFlowHelper = new DialogFlowHelper();
    this.visionHelper = new VisionHelper();
    this.youtubeHelper = new YoutubeHelper();
    this.botScheduler = new BotScheduler(this, this.youtubeHelper);

    const url = process.env.APP_URL || "https://botaviano.herokuapp.com:443";
    if (url) {
      this.bot.setWebHook(`${url}/bot${TELEGRAM_TOKEN}`);
    }

    this.bot.on("new_chat_members", async message => {
      const chatId = message.chat.id;

      await this.sendMessage(chatId, WELCOME_MESSAGE);
    });

    this.bot.onText(/\/getchatid/, async (message: TelegramBot.Message) => {
      return await this.sendMessage(
        message.chat.id,
        `:gear: ${message.chat.id}`
      );
    });

    this.bot.onText(/\/lastvideo/, async (message: TelegramBot.Message) => {
      const lastVideoLink = await this.youtubeHelper.getLastVideoLink();

      return await this.sendMessage(message.chat.id, `${lastVideoLink}`);
    });

    this.bot.onText(/\/say/, async (message: TelegramBot.Message) => {
      if (message.from.username !== Constants.ADMIN) {
        return;
      }

      return await this.sendMessage(
        Constants.GROUP_CHAT_ID,
        message.text.substring("/say".length).trim()
      );
    });

    this.bot.on("text", async (message: TelegramBot.Message) => {
      if (message.text.startsWith("/")) {
        return;
      }

      return await this.processMessage(message);
    });

    this.bot.on("photo", async (message: TelegramBot.Message) => {
      return await this.processPhoto(message);
    });
  }

  getBotTag(): string {
    return "@" + this.botName;
  }

  isBypassMessage(message: string) {
    const messageTest = message.toLowerCase();

    for (let bM of bypassMessages) {
      if (messageTest.match(bM)) {
        return true;
      }
    }

    return false;
  }

  messageMentionsBot(message: TelegramBot.Message, processedText: string) {
    return (
      processedText.toLowerCase().indexOf(this.getBotTag()) >= 0 ||
      (message.caption &&
        message.caption.toLowerCase().indexOf(this.getBotTag()) >= 0) ||
      (message.reply_to_message &&
        message.reply_to_message.from.username === this.botName)
    );
  }

  async processMessage(
    message: TelegramBot.Message,
    processedText: string = message.text
  ): Promise<void> {
    const chatId = message.chat.id;

    if (message.chat.type === "private") {
      const response = await this.dialogFlowHelper.executeDialogFlow(
        `p_${message.chat.id}`,
        processedText
      );
      await this.sendMessage(chatId, response);
      return;
    }

    if (
      this.messageMentionsBot(message, processedText) ||
      this.isBypassMessage(processedText)
    ) {
      if (processedText.toLowerCase().indexOf(this.getBotTag()) == 0) {
        processedText = processedText.substring(this.getBotTag().length).trim();
      }

      const response = await this.dialogFlowHelper.executeDialogFlow(
        `g_${message.chat.id}`,
        processedText
      );
      await this.sendMessage(chatId, response, {
        reply_to_message_id: message.message_id
      });
      return;
    }
  }

  async processPhoto(message: TelegramBot.Message): Promise<void> {
    const chatId = message.chat.id;

    const photoId = message.photo[message.photo.length - 1].file_id;
    const fileStream = this.bot.getFileStream(photoId);

    const result = await this.visionHelper.getInfoOnPhoto(fileStream);

    //Debug
    if (message.chat.type === "private") {
      const texts = result.textAnnotations;
      const labels = result.labelAnnotations;

      await this.debugDescriptions(chatId, "Texts", texts);
      await this.debugDescriptions(chatId, "Photo Labels", labels);
    }

    await this.photoCommenter.commentPhoto(message, result);
  }

  async debugDescriptions(
    chatId: number,
    text: string,
    descriptions: any[]
  ): Promise<void> {
    if (!descriptions || descriptions.length === 0) {
      return;
    }

    await this.sendMessage(
      chatId,
      `${text}\n` +
        descriptions
          .map(value => {
            return value.description;
          })
          .join("\n")
    );
  }

  async sendMessage(
    chatId: number,
    text: string,
    options: TelegramBot.SendMessageOptions = undefined
  ): Promise<void> {
    await this.bot.sendMessage(chatId, emoji.emojify(text), options);
    return;
  }
}

export default Bot;
