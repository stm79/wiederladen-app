import { z } from "zod";

export const velocityImportCommitSchema = z.object({
  groupId: z.string().min(1),
  sourceDevice: z.string().min(1),
  rawFileName: z.string().nullable().optional(),
  shots: z
    .array(
      z.object({
        shotNumber: z.number(),
        velocityMps: z.number().positive(),
      })
    )
    .min(1, "Keine gültigen Schüsse zum Importieren gefunden"),
});

export type VelocityImportCommitInput = z.infer<typeof velocityImportCommitSchema>;
