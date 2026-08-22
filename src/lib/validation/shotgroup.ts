import { z } from "zod";

export const shotGroupManualSchema = z.object({
  sessionId: z.string().min(1),
  loadId: z.string().nullable().optional(),
  distanceM: z.number().positive().nullable().optional(),
  extremeSpreadMm: z.number().positive().nullable().optional(),
  meanRadiusMm: z.number().positive().nullable().optional(),
  shotCount: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type ShotGroupManualInput = z.infer<typeof shotGroupManualSchema>;

const pointSchema = z.object({ x: z.number(), y: z.number() });

export const calibratedMeasurementSchema = z.object({
  imageId: z.string().min(1),
  groupId: z.string().min(1),
  calibration: z.object({
    p1: pointSchema,
    p2: pointSchema,
    realDistanceMm: z.number().positive(),
  }),
  shotPoints: z.array(pointSchema).min(2, "Mindestens 2 Einschüsse markieren"),
  extremeSpreadMm: z.number().positive(),
  meanRadiusMm: z.number().positive(),
});

export type CalibratedMeasurementInput = z.infer<typeof calibratedMeasurementSchema>;
