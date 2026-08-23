import { z } from "zod";

export const loadSchema = z.object({
  loadNumber: z.number().int().positive("Ladungsnummer muss größer als 0 sein"),
  variantLetter: z
    .string()
    .trim()
    .max(4)
    .regex(/^[A-Za-z]*$/, "Nur Buchstaben (A, B, C, …)"),
  name: z.string().nullable().optional(),
  createdAt: z.string().min(1, "Datum ist erforderlich"), // ISO date string (yyyy-mm-dd) from <input type="date">
  firearmId: z.string().min(1, "Waffe ist erforderlich"),
  caseBrand: z.string().nullable().optional(),
  caseQuantity: z.number().int().positive().nullable().optional(),
  caseLoadCount: z.number().int().positive().nullable().optional(),
  caseTrimLengthMm: z.number().positive().nullable().optional(),
  sizingDie: z.string().nullable().optional(),
  shoulderBumpMm: z.number().positive().nullable().optional(),
  bushingDiameterMm: z.number().positive().nullable().optional(),
  mandrelDiameterMm: z.number().positive().nullable().optional(),
  primer: z.string().nullable().optional(),
  powder: z.string().nullable().optional(),
  chargeGrains: z.number().positive("Ladungsmenge muss größer als 0 sein"),
  bullet: z.string().nullable().optional(),
  bulletWeightGr: z.number().positive().nullable().optional(),
  oalMm: z.number().positive().nullable().optional(),
  cbtoMm: z.number().positive().nullable().optional(),
  crimpInfo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  parentLoadId: z.string().nullable().optional(),
});

export type LoadInput = z.infer<typeof loadSchema>;

export const LOAD_OPTIONAL_TEXT_FIELDS = [
  "name",
  "caseBrand",
  "sizingDie",
  "primer",
  "powder",
  "bullet",
  "crimpInfo",
  "notes",
] as const;
