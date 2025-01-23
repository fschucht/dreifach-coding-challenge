import { z } from "zod";

const baseConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

export const baseConfig = baseConfigSchema.parse(process.env);
