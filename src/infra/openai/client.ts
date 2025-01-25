import { AzureOpenAI } from "openai";
import { openAiConfig } from "#config/openAi.config.ts";

export const openAiClient = new AzureOpenAI({
  endpoint: openAiConfig.OPENAI_ENDPOINT,
  apiKey: openAiConfig.OPENAI_API_KEY,
  deployment: openAiConfig.OPENAI_DEPLOYMENT,
  apiVersion: openAiConfig.OPENAI_VERSION,
});
