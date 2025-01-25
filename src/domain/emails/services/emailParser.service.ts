import dedent from "dedent";
import { zodToJsonSchema } from "zod-to-json-schema";
import { openAiConfig } from "#config/openAi.config.ts";
import { openAiClient } from "#infra/openai/client.ts";
import { Logger } from "#infra/pino/logger.ts";
import type { ParseEmailDto } from "../dtos/parseEmail.dto.ts";
import { type ParsedEmailEntity, parsedEmailEntitySchema } from "../entities/parsedEmail.entity.ts";

class EmailParserService {
  private readonly logger = new Logger(this.constructor.name);

  async parse(parseEmailDto: ParseEmailDto, remainingRetriesCount = 2): Promise<ParsedEmailEntity> {
    const fallbackParsedEmail: ParsedEmailEntity = {
      company: {},
      contactPerson: {
        email: parseEmailDto.from,
      },
      requests: [],
    };

    if (remainingRetriesCount === 0) {
      return fallbackParsedEmail;
    }

    const result = await openAiClient.chat.completions.create({
      model: openAiConfig.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: dedent`
            Parse the following emails into the structured JSON schema:
            ${JSON.stringify(zodToJsonSchema(parsedEmailEntitySchema))}
          `,
        },
        {
          role: "user",
          content: dedent`
            From: ${parseEmailDto.from}
            Subject: ${parseEmailDto.subject}
            Body: ${parseEmailDto.body}
          `,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    if (result.choices[0]?.finish_reason !== "stop") {
      return this.parse(parseEmailDto, remainingRetriesCount - 1);
    }

    const responseMessage = result.choices[0]?.message.content;

    if (typeof responseMessage !== "string") {
      return fallbackParsedEmail;
    }

    try {
      return parsedEmailEntitySchema.parse(JSON.parse(responseMessage));
    } catch (error) {
      this.logger.error("Received error while parsing email", { parseEmailDto, responseMessage, error });

      if (remainingRetriesCount > 0) {
        return this.parse(parseEmailDto, remainingRetriesCount - 1);
      }

      return fallbackParsedEmail;
    }
  }
}

export const emailParserService = new EmailParserService();
