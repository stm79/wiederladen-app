"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checklistStepSchema } from "@/lib/validation/checklist";

export async function createChecklistStep(label: string) {
  const { label: parsedLabel } = checklistStepSchema.parse({ label });
  const last = await prisma.checklistStep.aggregate({ _max: { sortOrder: true } });
  const step = await prisma.checklistStep.create({
    data: { label: parsedLabel, sortOrder: (last._max.sortOrder ?? 0) + 1 },
  });
  revalidatePath("/settings");
  return step;
}

export async function updateChecklistStep(id: string, label: string) {
  const { label: parsedLabel } = checklistStepSchema.parse({ label });
  await prisma.checklistStep.update({ where: { id }, data: { label: parsedLabel } });
  revalidatePath("/settings");
}

export async function deleteChecklistStep(id: string) {
  await prisma.checklistStep.delete({ where: { id } });
  revalidatePath("/settings");
}

export async function reorderChecklistSteps(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.checklistStep.update({ where: { id }, data: { sortOrder: index } }))
  );
  revalidatePath("/settings");
}

export async function toggleChecklistItem(loadId: string, stepId: string, checked: boolean) {
  if (checked) {
    await prisma.loadChecklistCheck.upsert({
      where: { loadId_stepId: { loadId, stepId } },
      update: {},
      create: { loadId, stepId },
    });
  } else {
    await prisma.loadChecklistCheck.deleteMany({ where: { loadId, stepId } });
  }
  revalidatePath(`/loads/${loadId}`);
}
