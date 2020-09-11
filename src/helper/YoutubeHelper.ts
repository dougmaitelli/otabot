import YouTube from "simple-youtube-api";

export interface YoutubeVideo {
  title: string;
  description: string;
  shortURL: string;
  publishedAt: Date;
}

class YoutubeHelper {
  youtube: YouTube;

  constructor() {
    this.youtube = new YouTube(process.env.YOUTUBE_API_KEY);
  }

  async getLatestVideo(): Promise<YoutubeVideo> {
    const videos = await this.youtube.searchVideos("", 1, {
      channelId: "UC68lo9oCCz9VbEFUqRD_mrg",
      order: "date",
    });

    return {
      title: videos[0].title,
      description: videos[0].description,
      shortURL: videos[0].shortURL,
      publishedAt: new Date(videos[0].publishedAt),
    };
  }
}

export default YoutubeHelper;
