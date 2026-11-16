import { z } from "zod";

export const caseLotSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich"),
  brand: z.string().nullable().optional(),
  caliber: z.string().nullable().optional(),
  quantity: z.number().int().positive().nullable().optional(),
  purchasedAt: z.string().nullable().optional(), // yyyy-mm-dd or ""
  retired: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

export type CaseLotInput = z.infer<typeof caseLotSchema>;

export const CASE_LOT_OPTIONAL_TEXT_FIELDS = ["brand", "caliber", "notes"] as const;
