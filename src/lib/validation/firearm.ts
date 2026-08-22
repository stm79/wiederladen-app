import { z } from "zod";

export const firearmSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  caliber: z.string().min(1, "Kaliber ist erforderlich"),
  barrelLenMm: z.number().positive().nullable().optional(),
  twistRate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type FirearmInput = z.infer<typeof firearmSchema>;

export const FIREARM_OPTIONAL_TEXT_FIELDS = ["twistRate", "notes"] as const;
