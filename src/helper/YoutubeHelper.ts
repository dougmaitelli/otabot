import YouTube from "simple-youtube-api";

export interface YoutubeVideo {
  title: string;
  description: string;
  shortURL: string;
  publishedAt: string;
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

    return videos[0] as YoutubeVideo;
  }
}

export default YoutubeHelper;
