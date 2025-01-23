import { z } from "zod";

export const parseEmailDtoSchema = z.object({
  from: z.string().email(),
  subject: z.string(),
  body: z.string(),
});

export type ParseEmailDto = z.infer<typeof parseEmailDtoSchema>;
