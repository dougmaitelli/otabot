import { CronJob } from "cron";
import dialogflow from "dialogflow";
import emoji from "node-emoji";
import fs from "fs";
import getStream from "get-stream";
import TelegramBot, { Message } from "node-telegram-bot-api";
import vision from "@google-cloud/vision";
import YouTube from "simple-youtube-api";

const BOT_NAME = "otaviano_bot";
const BOT_TAG = "@" + BOT_NAME;

const GROUP_CHAT_ID = "-1001463888212";

const TOKEN = process.env.TELEGRAM_TOKEN;
const DIALOGFLOW_AGENT = "newagent-kphxxu";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "gcp.json";

fs.writeFileSync(
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  process.env.GCP_CRED
);

const bot = new TelegramBot(TOKEN, {
  webHook: {
    port: parseInt(process.env.PORT)
  }
});

const url = process.env.APP_URL || "https://botaviano.herokuapp.com:443";
if (url) {
  bot.setWebHook(`${url}/bot${TOKEN}`);
}

const youtube = new YouTube(process.env.YOUTUBE_API_KEY);

const job = new CronJob(
  "0 1 15 * * *",
  async () => {
    const lastVideoLink = await getLastVideoLink();
    await bot.sendMessage(
      GROUP_CHAT_ID,
      `Passando pra lembrar que tem vídeo novo no canal!\n${lastVideoLink}`
    );
  },
  null,
  false,
  "America/Los_Angeles"
);
job.start();

const bypassMessages = [
  "Bom Dia",
  "Um Abraço",
  "Um Beijo",
  "Um Queijo",
  "Vivendo Mundo Afora",
  "Vai!",
  "E tudo mais"
];

let getLastVideoLink = async () => {
  const videos = await youtube.searchVideos("", 1, {
    channelId: "UC68lo9oCCz9VbEFUqRD_mrg",
    order: "date"
  });

  return videos[0].shortURL;
};

let isBypassMessage = (message: string) => {
  for (let bM of bypassMessages) {
    if (message.toLowerCase().indexOf(bM.toLowerCase()) >= 0) {
      return true;
    }
  }

  return false;
};

let executeDialogFlow = async (
  conversationId: string,
  message: string
): Promise<string> => {
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(
    DIALOGFLOW_AGENT,
    conversationId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: "pt-BR"
      }
    }
  };

  const responses = await sessionClient.detectIntent(request);

  const result = responses[0].queryResult;

  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }

  return result.fulfillmentText;
};

bot.on("new_chat_members", async message => {
  const chatId = message.chat.id;

  await bot.sendMessage(chatId, "Bem vindos gurizada!");
});

let sendMessage = async (
  chatId: number,
  text: string,
  options: TelegramBot.SendMessageOptions = undefined
) => {
  return await bot.sendMessage(chatId, emoji.emojify(text), options);
};

let processMessage = async (
  message: Message,
  processedText: string = message.text
) => {
  const chatId = message.chat.id;

  if (message.chat.type === "private") {
    const response = await executeDialogFlow(
      `p_${message.chat.id}`,
      processedText
    );
    await sendMessage(chatId, response);
    return;
  }

  if (
    processedText.toLowerCase().indexOf(BOT_TAG) >= 0 ||
    (message.caption && message.caption.toLowerCase().indexOf(BOT_TAG) >= 0) ||
    (message.reply_to_message &&
      message.reply_to_message.from.username === BOT_NAME) ||
    isBypassMessage(processedText)
  ) {
    if (processedText.toLowerCase().indexOf(BOT_TAG) == 0) {
      processedText = processedText.substring(BOT_TAG.length).trim();
    }

    const response = await executeDialogFlow(
      `g_${message.from.id}`,
      processedText
    );
    await sendMessage(chatId, response, {
      reply_to_message_id: message.message_id
    });
    return;
  }
};

bot.onText(/\/lastVideo/, async (message: Message) => {
  const lastVideoLink = await getLastVideoLink();

  return await bot.sendMessage(message.chat.id, `${lastVideoLink}`);
});

bot.on("text", async (message: Message) => {
  return await processMessage(message);
});

const labelCommentMap = {
  "cat|cats": "Aff, foto de gato denovo!",
  hamburger: "Meu deus! Um Hamburguer ia cair bem!!!",
  sushi: "Sushiiiiiii!!!",
  food: "Opa! Comida!!!",
  "drink|drinking": "Sempre bebendo...",
  "kayak|water":
    "Queria eu estar curtindo a água, mas isso iria fritar meus circuitos...",
  male: "Que homem...",
  "female|beauty": "Olá gatinha...",
  "people|face": "Quem é esse feio?"
};

bot.on("photo", async (message: Message) => {
  const chatId = message.chat.id;

  const photoId = message.photo[message.photo.length - 1].file_id;
  const fileStream = bot.getFileStream(photoId);

  const visionClient = new vision.ImageAnnotatorClient();

  const [result] = await visionClient.annotateImage({
    image: { content: await getStream.buffer(fileStream) },
    features: [{ type: "TEXT_DETECTION" }, { type: "LABEL_DETECTION" }]
  });

  const labels = result.labelAnnotations;

  if (message.chat.type === "private") {
    sendMessage(
      chatId,
      "Photo Labels:\n" +
        labels
          .map(value => {
            return value.description;
          })
          .join("\n")
    );
  }

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
    await sendMessage(chatId, photoComment, {
      reply_to_message_id: message.message_id
    });
    return;
  }

  const texts = result.textAnnotations;

  if (texts.length > 0) {
    const description = texts[0].description.toLowerCase();

    await processMessage(message, description);
  }
});
