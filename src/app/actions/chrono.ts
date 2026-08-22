"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isExcelFile, parseExcelTable } from "@/lib/chrono-import/parse-table";
import { detectCsvFormat, detectExcelFormat } from "@/lib/chrono-import/detect";
import { computeVelocityStats } from "@/lib/stats/velocity-stats";
import {
  velocityImportCommitSchema,
  type VelocityImportCommitInput,
} from "@/lib/validation/velocity-import";
import type { DetectedFormat } from "@/lib/chrono-import/types";

export async function parseChronoFile(
  formData: FormData
): Promise<{ detected: DetectedFormat; fileName: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Keine Datei übermittelt");
  }

  if (isExcelFile(file.name)) {
    const table = await parseExcelTable(file);
    return { detected: detectExcelFormat(table, file.name), fileName: file.name };
  }

  const text = await file.text();
  return { detected: detectCsvFormat(text, file.name), fileName: file.name };
}

export async function commitVelocityImport(input: VelocityImportCommitInput) {
  const data = velocityImportCommitSchema.parse(input);
  const stats = computeVelocityStats(data.shots.map((s) => s.velocityMps));

  const group = await prisma.shotGroup.findUniqueOrThrow({ where: { id: data.groupId } });

  const velocitySet = await prisma.velocitySet.create({
    data: {
      groupId: data.groupId,
      sourceDevice: data.sourceDevice,
      rawFileName: data.rawFileName ?? null,
      avgMps: stats?.avgMps ?? null,
      sdMps: stats?.sdMps ?? null,
      esMps: stats?.esMps ?? null,
      shots: { create: data.shots },
    },
  });

  revalidatePath(`/sessions/${group.sessionId}`);
  return velocitySet;
}

export async function deleteVelocitySet(id: string) {
  const set = await prisma.velocitySet.findUniqueOrThrow({ where: { id }, include: { group: true } });
  await prisma.velocitySet.delete({ where: { id } });
  revalidatePath(`/sessions/${set.group.sessionId}`);
}
