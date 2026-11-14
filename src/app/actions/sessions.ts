"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeEmptyStrings } from "@/lib/normalize";
import { computeVelocityStats } from "@/lib/stats/velocity-stats";
import {
  sessionMeasurementSchema,
  sessionSchema,
  SESSION_OPTIONAL_TEXT_FIELDS,
  type SessionInput,
  type SessionMeasurementInput,
} from "@/lib/validation/session";

/** Creates the session and, for every attached chrono file, a shot group for
 *  that load holding the imported velocities — all or nothing. */
export async function createSession(input: SessionInput, measurementsInput: SessionMeasurementInput[] = []) {
  const parsed = normalizeEmptyStrings(sessionSchema.parse(input), SESSION_OPTIONAL_TEXT_FIELDS);
  const measurements = sessionMeasurementSchema.array().parse(measurementsInput);
  const { loadIds: selectedLoadIds, firearmIds, ...data } = parsed;
  // A load with measurements was obviously used in this session.
  const loadIds = Array.from(new Set([...selectedLoadIds, ...measurements.map((m) => m.loadId)]));

  const session = await prisma.session.create({
    data: {
      ...data,
      date: new Date(data.date),
      sessionLoads: { create: loadIds.map((loadId) => ({ loadId })) },
      sessionFirearms: { create: firearmIds.map((firearmId) => ({ firearmId })) },
      groups: {
        create: measurements.map((m) => {
          const stats = computeVelocityStats(m.shots.map((s) => s.velocityMps));
          return {
            loadId: m.loadId,
            source: "manual",
            velocitySets: {
              create: {
                sourceDevice: m.sourceDevice,
                rawFileName: m.rawFileName ?? null,
                avgMps: stats?.avgMps ?? null,
                sdMps: stats?.sdMps ?? null,
                esMps: stats?.esMps ?? null,
                shots: { create: m.shots },
              },
            },
          };
        }),
      },
    },
  });
  revalidatePath("/sessions");
  return session;
}

export async function updateSession(id: string, input: SessionInput) {
  const parsed = normalizeEmptyStrings(sessionSchema.parse(input), SESSION_OPTIONAL_TEXT_FIELDS);
  const { loadIds, firearmIds, ...data } = parsed;
  const session = await prisma.$transaction(async (tx) => {
    await tx.sessionLoad.deleteMany({ where: { sessionId: id } });
    await tx.sessionFirearm.deleteMany({ where: { sessionId: id } });
    return tx.session.update({
      where: { id },
      data: {
        ...data,
        date: new Date(data.date),
        sessionLoads: { create: loadIds.map((loadId) => ({ loadId })) },
        sessionFirearms: { create: firearmIds.map((firearmId) => ({ firearmId })) },
      },
    });
  });
  revalidatePath("/sessions");
  revalidatePath(`/sessions/${id}`);
  return session;
}

export async function deleteSession(id: string) {
  await prisma.session.delete({ where: { id } });
  revalidatePath("/sessions");
}
