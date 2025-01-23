import { Queue } from "bullmq";
import { ioredisConnection } from "#infra/ioredis/connection.ts";
import type { EmailsQueueJob } from "../jobs/emailsQueue.job.ts";

export const EMAILS_QUEUE_NAME = "emails";

export const emailsQueue = new Queue<EmailsQueueJob>(EMAILS_QUEUE_NAME, {
  connection: ioredisConnection,
});
