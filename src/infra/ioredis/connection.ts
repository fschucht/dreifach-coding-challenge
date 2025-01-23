import { Redis } from "ioredis";
import { ioredisConfig } from "#config/ioredis.config.ts";

export const ioredisConnection = new Redis({
  host: ioredisConfig.REDIS_HOST,
  port: ioredisConfig.REDIS_PORT,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});
