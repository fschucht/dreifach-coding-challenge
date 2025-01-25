import { z } from "zod";

const PARSED_EMAIL_PURPOSE = [
  "NEW_POLICY_REQUEST",
  "POLICY_RENEWAL",
  "POLICY_MODIFICATION",
  "QUOTE_REQUEST",
  "INFORMATION_REQUEST",
] as const;
export type ParsedEmailPurpose = (typeof PARSED_EMAIL_PURPOSE)[number];

const PARSED_EMAIL_INSURANCE_TYPE = ["TRANSPORT", "PRODUCT_LIABILITY", "ENVIRONMENTAL_LIABILITY"] as const;
export type ParsedEmailInsuranceType = (typeof PARSED_EMAIL_INSURANCE_TYPE)[number];

function treatEmptyValueAsUndefined(value: unknown): string | undefined {
  if (typeof value === "string" && value !== "null" && value.trim().length > 0) {
    return value;
  }

  return undefined;
}

export const parsedEmailEntitySchema = z.object({
  company: z.object({
    name: z.string().optional(),
  }),
  contactPerson: z.object({
    name: z.string().optional(),
    email: z.string().email(),
  }),
  requests: z.array(
    z
      .object({
        purpose: z.enum(PARSED_EMAIL_PURPOSE).default("INFORMATION_REQUEST"),
        insurance: z
          .object({
            type: z.enum(PARSED_EMAIL_INSURANCE_TYPE),
            desiredCoverageStartDate: z.coerce.date().optional().describe("The desired coverage start date of the insurance."),
            coveredEmployeesCount: z.coerce
              .number()
              .int()
              .optional()
              .describe("The number of employees covered by the insurance (if applicable)."),
            insuredItemOrActivity: z
              .object({
                name: z.coerce
                  .string()
                  .describe(
                    "The name of the insured item or activity which should be covered by the insurance (written in the language of the email).",
                  ),
                value: z.coerce
                  .number()
                  .transform((value) => (value === 0 ? undefined : value))
                  .optional()
                  .describe("The insured value of the item or activity (if applicable)."),
                origin: z.coerce
                  .string()
                  .transform(treatEmptyValueAsUndefined)
                  .optional()
                  .describe("The origin of the transport activity (only applicable to TRANSPORT insurance when mentioned in the email)."),
                destination: z.coerce
                  .string()
                  .transform(treatEmptyValueAsUndefined)
                  .optional()
                  .describe(
                    "The destination of the transport activity (only applicable to TRANSPORT insurance when mentioned in the email).",
                  ),
              })
              .describe("The insured item or activity."),
          })
          .optional()
          .describe("All infos about the insurance mentioned in the email."),
      })
      .describe("All infos about each request made in the email. Only include requests matching one of the purposes."),
  ),
});

export type ParsedEmailEntity = z.infer<typeof parsedEmailEntitySchema>;

export const parseEmailResultEntitySchema = z.object({
  result: parsedEmailEntitySchema,
  confidenceScore: z.number().int(),
});

export type ParseEmailResultEntity = z.infer<typeof parseEmailResultEntitySchema>;
