import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { parseEmailDtoSchema } from "#domain/emails/dtos/parseEmail.dto.ts";
import { emailParserService } from "#domain/emails/services/emailParser.service.ts";
import { emailsQueue } from "#infra/bullmq/queues/emails.queue.ts";

export const emailsApi = new Hono().basePath("/emails").post("/parse", zValidator("json", parseEmailDtoSchema), async (context) => {
  const parseEmailDto = context.req.valid("json");
  const parsedEmailResult = await emailParserService.parse(parseEmailDto);

  for (const request of parsedEmailResult.result.requests) {
    emailsQueue.add(request.purpose, {
      email: parseEmailDto,
      result: {
        company: parsedEmailResult.result.company,
        contactPerson: parsedEmailResult.result.contactPerson,
        request: request,
      },
      confidenceScore: parsedEmailResult.confidenceScore,
    });
  }

  context.status(201);

  return context.json({
    data: parsedEmailResult,
  });
});
