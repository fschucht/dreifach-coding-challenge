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
    // We define a fallback result for the email parsing, as an error in parsing the email should not lead discard the email
    // altogether. Instead, this allows us to keep processing the email and, for example, flag it for manual review.
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
        // Currently, we use the legacy JSON mode to retrieve the parsed email as JSON, as the model version available
        // at the Azure endpoint does not support the `json_schema` response format. Support was added in model version
        // `2024-08-06` but the endpoint still uses `2024-08-01-preview` and returns an error when the response format is used.
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

      return this.parse(parseEmailDto, remainingRetriesCount - 1);
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

      // We ask the model to return a single value (true or false) and use it's log probabilities to calculate the
      // confidence score. The log probability indicates the likelihood that the token should appear in the context of
      // the prompt. Therefore, we can use it as a measurement of confidence, as a higher likelihood indicates a higher
      // match between the instructions, email and json result.
      const logProbs = result.choices[0]?.logprobs?.content;

      if (logProbs?.length !== 1) {
        return 0;
      }

      const logProb = logProbs[0];

      if (logProb) {
        const rawConfidenceScore = Math.exp(logProb.logprob);

        if (logProb.token === "true") {
          // In case the model determines that the parsed email accurately reflects the email, we return the unchanged
          // confidence score.
          return rawConfidenceScore;
        }

        if (logProb.token === "false") {
          // In case the model determines that the parsed email does not accurately reflect the email, we invert the
          // confidence score. The inverted confidence score should reflect the confidence the model has in case the model
          // would respond with `true`.
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
