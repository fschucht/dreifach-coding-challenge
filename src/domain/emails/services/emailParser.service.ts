import type { ParseEmailDto } from "../dtos/parseEmail.dto.ts";
import type { ParsedEmailEntity } from "../entities/parsedEmail.entity.ts";

class EmailParserService {
  parse(dto: ParseEmailDto): ParsedEmailEntity {
    return {
      company: {},
      contactPerson: {
        email: dto.from,
      },
      requests: [],
    };
  }
}

export const emailParserService = new EmailParserService();
