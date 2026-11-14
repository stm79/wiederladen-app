import { z } from "zod";

export const sessionSchema = z.object({
  date: z.string().min(1, "Datum ist erforderlich"), // ISO date string (yyyy-mm-dd) from <input type="date">
  location: z.string().nullable().optional(),
  tempC: z.number().nullable().optional(),
  pressureHPa: z.number().nullable().optional(),
  humidityPct: z.number().min(0).max(100).nullable().optional(),
  firearmIds: z.array(z.string()),
  notes: z.string().nullable().optional(),
  loadIds: z.array(z.string()),
});

export type SessionInput = z.infer<typeof sessionSchema>;

export const SESSION_OPTIONAL_TEXT_FIELDS = ["location", "notes"] as const;

/** Chrono data attached to a load while creating a session; each one becomes
 *  a shot group for that load with the imported velocity set. */
export const sessionMeasurementSchema = z.object({
  loadId: z.string().min(1),
  sourceDevice: z.string().min(1),
  rawFileName: z.string().nullable().optional(),
  shots: z
    .array(z.object({ shotNumber: z.number(), velocityMps: z.number().positive() }))
    .min(1, "Keine gültigen Schüsse zum Importieren gefunden"),
});

export type SessionMeasurementInput = z.infer<typeof sessionMeasurementSchema>;
