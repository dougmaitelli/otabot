import dialogflow from "dialogflow";

const DIALOGFLOW_AGENT = "newagent-kphxxu";

class DialogFlowHelper {
  sessionClient: dialogflow.SessionsClient;

  constructor() {
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
}

export default DialogFlowHelper;
