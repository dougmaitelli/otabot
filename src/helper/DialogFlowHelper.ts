import dialogflow from "@google-cloud/dialogflow";
import { SessionsClient } from "@google-cloud/dialogflow/build/src/v2";

const DIALOGFLOW_PROJECT_ID = "newagent-kphxxu";

class DialogFlowHelper {
  sessionClient: SessionsClient;

  constructor() {
    this.sessionClient = new dialogflow.SessionsClient();
  }

  async executeDialogFlow(
    conversationId: string,
    message: string
  ): Promise<string> {
    const sessionPath = this.sessionClient.projectAgentSessionPath(
      DIALOGFLOW_PROJECT_ID,
      conversationId
    );

    const responses = await this.sessionClient.detectIntent({
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "pt-BR",
        },
      },
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
