import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { parseEmailDtoSchema } from "#domain/emails/dtos/parseEmail.dto.ts";
import { emailParserService } from "#domain/emails/services/emailParser.service.ts";

export const emailsApi = new Hono().basePath("/emails").post("/parse", zValidator("json", parseEmailDtoSchema), (context) => {
  const parsedEmail = emailParserService.parse(context.req.valid("json"));

  context.status(201);

  return context.json({
    data: parsedEmail,
  });
});
