import { z } from "zod";

export const PARSED_EMAIL_PURPOSE = [
  "NEW_POLICY_REQUEST",
  "POLICY_RENEWAL",
  "POLICY_MODIFICATION",
  "QUOTE_REQUEST",
  "INFORMATION_REQUEST",
] as const;
export type ParsedEmailPurpose = (typeof PARSED_EMAIL_PURPOSE)[number];

export const PARSED_EMAIL_INSURANCE_TYPE = ["TRANSPORT", "PRODUCT_LIABILITY", "ENVIRONMENTAL_LIABILITY"] as const;
export type ParsedEmailInsuranceType = (typeof PARSED_EMAIL_INSURANCE_TYPE)[number];

const parsedEmailRequestBaseInsuranceSchema = z.object({
  type: z.enum(PARSED_EMAIL_INSURANCE_TYPE),
  startDate: z.coerce.date().optional(),
  coveredEmployeesCount: z.number().int().optional(),
});

const parsedEmailRequestTransportInsuranceSchema = parsedEmailRequestBaseInsuranceSchema.extend({
  type: z.literal("TRANSPORT"),
  itemOrActivity: z.object({
    name: z.string(),
    value: z.number().optional(),
    origin: z.string(),
    destination: z.string(),
  }),
});

// Product Liability-specific schema
const parsedEmailRequestProductLiabilityInsuranceSchema = parsedEmailRequestBaseInsuranceSchema.extend({
  type: z.literal("PRODUCT_LIABILITY"),
  itemOrActivity: z.object({
    name: z.string(),
    value: z.number().optional(),
  }),
});

// Environmental Liability-specific schema
const parsedEmailRequestEnvironmentalLiabilityInsuranceSchema = parsedEmailRequestBaseInsuranceSchema.extend({
  type: z.literal("ENVIRONMENTAL_LIABILITY"),
  itemOrActivity: z.object({
    name: z.string(),
    value: z.number().optional(),
  }),
});

// Combined insurance schema (discriminated union)
const parsedEmailRequestInsuranceEntitySchema = z.discriminatedUnion("type", [
  parsedEmailRequestTransportInsuranceSchema,
  parsedEmailRequestProductLiabilityInsuranceSchema,
  parsedEmailRequestEnvironmentalLiabilityInsuranceSchema,
]);

const parsedEmailRequestEntitySchema = z.object({
  purpose: z.enum(PARSED_EMAIL_PURPOSE),
  insurance: parsedEmailRequestInsuranceEntitySchema,
});

export type ParsedEmailRequestEntity = z.infer<typeof parsedEmailRequestEntitySchema>;

const parsedEmailEntitySchema = z.object({
  company: z.object({
    name: z.string().optional(),
  }),
  contactPerson: z.object({
    name: z.string().optional(),
    email: z.string().email(),
  }),
  requests: z.array(parsedEmailRequestEntitySchema),
});

export type ParsedEmailEntity = z.infer<typeof parsedEmailEntitySchema>;
