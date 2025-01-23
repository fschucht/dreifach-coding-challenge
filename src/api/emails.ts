import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { parseEmailDtoSchema } from "#domain/emails/dtos/parseEmail.dto.ts";
import { emailParserService } from "#domain/emails/services/emailParser.service.ts";
import { emailsQueue } from "#infra/bullmq/queues/emails.queue.ts";

export const emailsApi = new Hono().basePath("/emails").post("/parse", zValidator("json", parseEmailDtoSchema), (context) => {
  const parsedEmail = emailParserService.parse(context.req.valid("json"));

  for (const request of parsedEmail.requests) {
    emailsQueue.add(request.purpose, {
      company: parsedEmail.company,
      contactPerson: parsedEmail.contactPerson,
      request: request,
    });
  }

  context.status(201);

  return context.json({
    data: parsedEmail,
  });
});
