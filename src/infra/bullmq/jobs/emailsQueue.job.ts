import type { Job } from "bullmq";
import type { ParseEmailDto } from "#domain/emails/dtos/parseEmail.dto.ts";
import type { ParsedEmailEntity, ParsedEmailPurpose } from "#domain/emails/entities/parsedEmailResult.entity.ts";

export type EmailsQueueJob = Job<
  {
    email: ParseEmailDto;
    result: Omit<ParsedEmailEntity, "requests"> & { request: ParsedEmailEntity["requests"][0] };
    confidenceScore: number;
  },
  void,
  ParsedEmailPurpose
>;
