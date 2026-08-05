import vision from "@google-cloud/vision";
import { ImageAnnotatorClient } from "@google-cloud/vision/build/src/v1";
import { buffer } from "node:stream/consumers";

class VisionHelper {
  visionClient: ImageAnnotatorClient;

  constructor() {
    this.visionClient = new vision.ImageAnnotatorClient();
  }

  async getInfoOnPhoto(fileStream) {
    const [result] = await this.visionClient.annotateImage({
      image: { content: await buffer(fileStream) },
      features: [{ type: "TEXT_DETECTION" }, { type: "LABEL_DETECTION" }],
    });

    return result;
  }
}

export default VisionHelper;
