import { z } from "zod";

export const checklistStepSchema = z.object({
  label: z.string().trim().min(1, "Bezeichnung ist erforderlich").max(200),
});

export type ChecklistStepInput = z.infer<typeof checklistStepSchema>;
