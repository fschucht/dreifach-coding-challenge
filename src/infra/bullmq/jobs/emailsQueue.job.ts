import type { Job } from "bullmq";
import type { ParsedEmailEntity, ParsedEmailPurpose, ParsedEmailRequestEntity } from "#domain/emails/entities/parsedEmail.entity.ts";

export type EmailsQueueJob = Job<
  {
    company: ParsedEmailEntity["company"];
    contactPerson: ParsedEmailEntity["contactPerson"];
    request: ParsedEmailRequestEntity;
  },
  void,
  ParsedEmailPurpose
>;
