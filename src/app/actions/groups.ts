"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeEmptyStrings } from "@/lib/normalize";
import {
  shotGroupManualSchema,
  calibratedMeasurementSchema,
  type ShotGroupManualInput,
  type CalibratedMeasurementInput,
} from "@/lib/validation/shotgroup";

export async function createShotGroup(input: ShotGroupManualInput) {
  const data = normalizeEmptyStrings(shotGroupManualSchema.parse(input), ["notes", "loadId"]);
  const group = await prisma.shotGroup.create({ data: { ...data, source: "manual" } });
  revalidatePath(`/sessions/${data.sessionId}`);
  return group;
}

export async function updateShotGroupManual(id: string, input: ShotGroupManualInput) {
  const data = normalizeEmptyStrings(shotGroupManualSchema.parse(input), ["notes", "loadId"]);
  const group = await prisma.shotGroup.update({ where: { id }, data });
  revalidatePath(`/sessions/${data.sessionId}`);
  return group;
}

export async function deleteShotGroup(id: string) {
  const group = await prisma.shotGroup.findUniqueOrThrow({ where: { id } });
  await prisma.shotGroup.delete({ where: { id } });
  revalidatePath(`/sessions/${group.sessionId}`);
}

export async function saveCalibratedMeasurement(input: CalibratedMeasurementInput) {
  const data = calibratedMeasurementSchema.parse(input);

  const [image, group] = await prisma.$transaction([
    prisma.groupImage.update({
      where: { id: data.imageId },
      data: {
        calibration: JSON.stringify(data.calibration),
        shotPoints: JSON.stringify(data.shotPoints),
      },
    }),
    prisma.shotGroup.update({
      where: { id: data.groupId },
      data: {
        extremeSpreadMm: data.extremeSpreadMm,
        meanRadiusMm: data.meanRadiusMm,
        shotCount: data.shotPoints.length,
        source: "calibrated",
      },
    }),
  ]);

  revalidatePath(`/sessions/${group.sessionId}`);
  return { image, group };
}
