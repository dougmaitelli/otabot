import { CronJob } from "cron";
import Constants from "../Constants";
import YoutubeHelper from "../helper/YoutubeHelper";
import Bot from "./Bot";

const YOUTUBE_CHECK_INTERVAL_MINUTES = 30;

const COMEMORATIVE_DATES = {
  1: {
    1: "Feliz Ano Novo!",
    19: "Feliz dia do Cabeleireiro!",
    20: "Feliz dia do Farmacêutico!",
  },
  2: {
    1: "Feliz dia do Publicitário!",
  },
  3: {
    8: "Feliz dia Internacional da Mulher!",
    12: "Feliz dia do Bibliotecário!",
    14: "Feliz dia dos Carecas!",
    15: "Feliz dia do Consumidor!",
  },
  4: {
    1: "Aprendi a Pescar... Mentira! Feliz dia dos Bobos!",
    7: "Feliz dia do Corretor, do Jornalista e do Médico Legista!",
    15: "Feliz dia do Ciclista!",
    19: "Feliz dia do Índio!",
    28: "Feliz dia da Sogra!",
    29: "Feliz dia da Danca!",
  },
  5: {
    1: "Feliz dia do Trabalhador!",
    6: "Feliz dia do Cartografo!",
    8: "Feliz dia do Artista Plástico!",
    10: "Feliz dia do Guia de Turismo!",
    13: "Feliz dia do Chefe de Cozinha!",
    19: "Feliz dia do Profissional de Física!",
    22: "Feliz dia do Apicultor!",
    23: "Feliz dia do Sol!",
    24: "Feliz dia da Lua!",
    25: "Feliz dia do Indústria e do Industrial!",
    27: "Feliz dia do Profissional Liberal!",
    29: "Feliz dia do Geografo!",
    31: "Feliz dia do Comissário de Voo!",
  },
  6: {
    8: "Feliz dia do Cunhado!",
    12: "Feliz Dia dos Namorados!",
    18: "Feliz dia do Químico!",
    29: "Feliz dia do Dublador!",
  },
  7: {
    8: "Feliz dia do Pesquisador!",
    13: "Feliz dia do Rock!",
    20: "Feliz dia do Amigo!",
    26: "Feliz dia dos Avós!",
  },
  8: {
    11: "Feliz dia do Estudante!",
    13: "Feliz dia do Canhoto!",
    22: "Feliz dia do Supervisor e do Coordenador!",
    23: "Feliz dia do Susto!",
    25: "Feliz dia do Soldado, do Feirante e do Miojo! Cade o dia do milho??",
    27: "Feliz dia do Psicologo e do Corretor de Imoveis!",
    31: "Feliz dia do Nutricionista!",
  },
  9: {
    1: "Feliz dia do Profissional de Educação Física!",
    3: "Feliz dia do Biólogo!",
    5: "Feliz dia dos Irmãos!",
    7: "Feliz dia da Independência!",
    9: "Feliz dia do Administrador!",
    13: "Feliz dia do Programador!",
    15: "Feliz dia do Cliente!",
    21: "Feliz dia da Árvore!",
    22: "Feliz dia do Contador!",
    25: "Feliz dia do Hipnólogo!",
    26: "Feliz dia dos Surdos!",
    30: "Feliz dia da Secretaria!",
  },
  10: {
    4: "Feliz dia dos Animais!",
    12: "Feliz dia das Crianças e do Engenheiro Agrônomo!",
    15: "Feliz dia do Professor!",
    18: "Feliz dia do Médico!",
    20: "Feliz dia do Arquivista!",
    25: "Feliz dia do Dentista!",
    28: "Feliz dia do Servidor Público!",
    31: "Feliz Halloween!",
  },
  11: {
    2: "finados",
    7: "Feliz dia do Radialista!",
    15: "Feliz dia da Proclamação da República!",
    19: "Feliz dia da Bandeira Nacional e dia Internacional do Homem!",
    20: "Feliz dia do Biomédico!",
    23: "Feliz dia do Engenheiro Eletricista!",
  },
  12: {
    9: "Feliz dia do Fonoaudiólogo!",
    11: "Feliz dia do Engenheiro Civil!",
    15: "Feliz dia do Arquiteto e Urbanista!",
    18: "Feliz dia do Museólogo!",
    25: "Feliz Natal!",
  },
};

class BotScheduler {
  bot: Bot;
  youtubeHelper: YoutubeHelper;

  videoReminderJob: CronJob;
  everyDayJob: CronJob;

  constructor(bot: Bot, youtubeHelper: YoutubeHelper) {
    this.bot = bot;
    this.youtubeHelper = youtubeHelper;

    this.videoReminderJob = new CronJob(
      `0 */${YOUTUBE_CHECK_INTERVAL_MINUTES} * * * *`,
      async () => {
        const lastVideo = await youtubeHelper.getLatestVideo();

        const minutesSinceLastVideo =
          (new Date().getTime() - lastVideo.publishedAt.getTime()) / 1000 / 60;

        if (minutesSinceLastVideo < YOUTUBE_CHECK_INTERVAL_MINUTES) {
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

    this.everyDayJob = new CronJob(
      `0 1 0 */1 * *`,
      async () => {
        const currentDate = new Date();

        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;

        const message = COMEMORATIVE_DATES[month][day];

        if (message) {
          await this.bot.sendMessage(Constants.GROUP_CHAT_ID, message);
        }
      },
      null,
      false,
      "America/Sao_Paulo"
    );
    this.everyDayJob.start();
  }
}

export default BotScheduler;
