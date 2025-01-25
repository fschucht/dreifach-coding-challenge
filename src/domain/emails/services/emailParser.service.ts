import dedent from "dedent";
import { zodToJsonSchema } from "zod-to-json-schema";
import { openAiConfig } from "#config/openAi.config.ts";
import { openAiClient } from "#infra/openai/client.ts";
import { Logger } from "#infra/pino/logger.ts";
import type { ParseEmailDto } from "../dtos/parseEmail.dto.ts";
import { type ParseEmailResultEntity, type ParsedEmailEntity, parsedEmailEntitySchema } from "../entities/parsedEmailResult.entity.ts";

class EmailParserService {
  private readonly logger = new Logger(this.constructor.name);

  async parse(parseEmailDto: ParseEmailDto, remainingRetriesCount = 2): Promise<ParseEmailResultEntity> {
    const fallbackResult: ParseEmailResultEntity = {
      result: {
        company: {},
        contactPerson: {
          email: parseEmailDto.from,
        },
        requests: [],
      },
      confidenceScore: 0,
    };

    if (remainingRetriesCount === 0) {
      return fallbackResult;
    }

    try {
      const {
        choices: [choice],
      } = await openAiClient.chat.completions.create({
        model: openAiConfig.OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: dedent`
              Parse the following email into the structured JSON schema.

              JSON Schema:
              \`${JSON.stringify(zodToJsonSchema(parsedEmailEntitySchema))}\`

              Email:
              \`${JSON.stringify(parseEmailDto)}\`
            `,
          },
        ],
        response_format: {
          type: "json_object",
        },
      });

      if (choice?.finish_reason !== "stop") {
        return this.parse(parseEmailDto, remainingRetriesCount - 1);
      }

      const response = choice?.message.content;

      if (typeof response !== "string") {
        return fallbackResult;
      }

      const parsedEmail = parsedEmailEntitySchema.safeParse(JSON.parse(response));

      if (!parsedEmail.success) {
        this.logger.error("Received error while parsing email", {
          email: parseEmailDto,
          response: response,
          error: parsedEmail.error,
        });

        return this.parse(parseEmailDto, remainingRetriesCount - 1);
      }

      const confidenceScore = await this.calculateConfidenceScore(parseEmailDto, parsedEmail.data);

      return {
        result: parsedEmail.data,
        confidenceScore: confidenceScore,
      };
    } catch (error) {
      this.logger.error("Received error while parsing email", {
        email: parseEmailDto,
        error: error,
      });

      if (remainingRetriesCount > 0) {
        return this.parse(parseEmailDto, remainingRetriesCount - 1);
      }

      return fallbackResult;
    }
  }

  private async calculateConfidenceScore(parseEmailDto: ParseEmailDto, parsedEmail: ParsedEmailEntity): Promise<number> {
    try {
      const result = await openAiClient.chat.completions.create({
        model: openAiConfig.OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: dedent`
              Does the extracted JSON data accurately reflect the requests made in the email below?
              Do the extracted request purposes and insurance types match the original email?
              Do the extracted insurance details match the original email?
              Does the extracted data contain data that is not present in the original email?
              Does the extracted data miss data present in the original email?

              Respond with just one word, the boolean true or false. You must output the word 'true', or the word 'false', nothing else.

              Original Email:
              \`${JSON.stringify(parseEmailDto)}\`

              Extracted JSON data:
              \`${JSON.stringify(parsedEmail)}\`
            `,
          },
        ],
        logprobs: true,
      });

      const logProbs = result.choices[0]?.logprobs?.content;

      if (logProbs?.length !== 1) {
        return 0;
      }

      const logProb = logProbs[0];

      if (logProb) {
        const rawConfidenceScore = Math.exp(logProb.logprob);

        if (logProb.token === "true") {
          return rawConfidenceScore;
        }

        if (logProb.token === "false") {
          return 1 - rawConfidenceScore;
        }
      }

      return 0;
    } catch (error) {
      this.logger.error("Received error while calculating confidence score", { parseEmailDto, parsedEmail, error });

      return 0;
    }
  }
}

export const emailParserService = new EmailParserService();
