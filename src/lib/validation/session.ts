import { z } from "zod";

export const sessionSchema = z.object({
  date: z.string().min(1, "Datum ist erforderlich"), // ISO date string (yyyy-mm-dd) from <input type="date">
  location: z.string().nullable().optional(),
  tempC: z.number().nullable().optional(),
  pressureHPa: z.number().nullable().optional(),
  humidityPct: z.number().min(0).max(100).nullable().optional(),
  distanceM: z.number().positive().nullable().optional(),
  firearmId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  loadIds: z.array(z.string()),
});

export type SessionInput = z.infer<typeof sessionSchema>;

export const SESSION_OPTIONAL_TEXT_FIELDS = ["location", "notes", "firearmId"] as const;
