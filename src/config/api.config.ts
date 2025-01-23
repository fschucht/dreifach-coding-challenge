import { z } from "zod";

const apiConfigSchema = z.object({
  HOSTNAME: z.string().ip().or(z.literal("localhost")).default("localhost"),
  PORT: z.coerce.number().int().default(3000),
});

export const apiConfig = apiConfigSchema.parse(process.env);
