import { z } from "zod";

const openAiConfigSchema = z.object({
  OPENAI_API_KEY: z.string(),
  OPENAI_REGION: z.string().default("swedencentral"),
  OPENAI_ENDPOINT: z.string().url().endsWith(".openai.azure.com/"),
  OPENAI_VERSION: z.string().default("2024-08-01-preview"),
  OPENAI_MODEL: z.string().default("gpt-4o"),
  OPENAI_DEPLOYMENT: z.string().default("gpt-4o"),
});

export const openAiConfig = openAiConfigSchema.parse(process.env);
