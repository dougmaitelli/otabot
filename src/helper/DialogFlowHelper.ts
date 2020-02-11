import dialogflow from "dialogflow";

const DIALOGFLOW_AGENT = "newagent-kphxxu";

class DialogFlowHelper {
  intentsClient: dialogflow.IntentsClient;
  sessionClient: dialogflow.SessionsClient;

  constructor() {
    this.intentsClient = new dialogflow.IntentsClient();
    this.sessionClient = new dialogflow.SessionsClient();
  }

  async executeDialogFlow(
    conversationId: string,
    message: string
  ): Promise<string> {
    const sessionPath = this.sessionClient.sessionPath(
      DIALOGFLOW_AGENT,
      conversationId
    );

    const responses = await this.sessionClient.detectIntent({
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "pt-BR"
        }
      }
    });

    const result = responses[0].queryResult;

    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }

    return result.fulfillmentText;
  }

  async getCommentForPhotoLabel(label: string): Promise<string> {
    const intentPath = this.intentsClient.intentPath(
      DIALOGFLOW_AGENT,
      `vma._photos.${label}`
    );

    const intent = await this.intentsClient.getIntent({
      name: intentPath
    });

    if (intent) {
      return intent.messages[
        Math.floor(Math.random() * intent.messages.length)
      ];
    }

    return null;
  }
}

export default DialogFlowHelper;
