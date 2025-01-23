import { z } from "zod";

const ioredisConfigSchema = z.object({
  REDIS_HOST: z.coerce.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
});

export const ioredisConfig = ioredisConfigSchema.parse(process.env);
