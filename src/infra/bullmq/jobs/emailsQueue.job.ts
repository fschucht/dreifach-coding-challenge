import type { Job } from "bullmq";
import type { ParseEmailDto } from "#domain/emails/dtos/parseEmail.dto.ts";
import type { ParsedEmailEntity, ParsedEmailPurpose, ParsedEmailRequestEntity } from "#domain/emails/entities/parsedEmailResult.entity.ts";

export type EmailsQueueJob = Job<
  {
    email: ParseEmailDto;
    result: {
      company: ParsedEmailEntity["company"];
      contactPerson: ParsedEmailEntity["contactPerson"];
      request: ParsedEmailRequestEntity;
    };
    confidenceScore: number;
  },
  void,
  ParsedEmailPurpose
>;
