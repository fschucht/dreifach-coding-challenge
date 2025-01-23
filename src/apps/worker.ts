import { Worker } from "bullmq";
import type { EmailsQueueJob } from "#infra/bullmq/jobs/emailsQueue.job.ts";
import { EMAILS_QUEUE_NAME } from "#infra/bullmq/queues/emails.queue.ts";
import { ioredisConnection } from "#infra/ioredis/connection.ts";
import { Logger } from "#infra/pino/logger.ts";

const logger = new Logger("worker");

logger.info("Starting worker");

const worker = new Worker<EmailsQueueJob>(
  EMAILS_QUEUE_NAME,
  async (job) => {
    logger.info("Received job", { jobId: job.id, data: job.data });
  },
  {
    connection: ioredisConnection,
  },
)
  .on("completed", (job) => {
    logger.info("Completed job", { jobId: job.id });
  })
  .on("failed", (job, error) => {
    logger.error("Failed job", { jobId: job?.id, error: error });
  });

process.on("exit", async (signal) => {
  logger.info("Received SIGTERM signal", { signal });
  logger.info("Closing worker");

  await worker.close();

  logger.info("Closed worker");
  process.exit(0);
});
