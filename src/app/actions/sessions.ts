"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeEmptyStrings } from "@/lib/normalize";
import { sessionSchema, SESSION_OPTIONAL_TEXT_FIELDS, type SessionInput } from "@/lib/validation/session";

export async function createSession(input: SessionInput) {
  const parsed = normalizeEmptyStrings(sessionSchema.parse(input), SESSION_OPTIONAL_TEXT_FIELDS);
  const { loadIds, firearmIds, ...data } = parsed;
  const session = await prisma.session.create({
    data: {
      ...data,
      date: new Date(data.date),
      sessionLoads: { create: loadIds.map((loadId) => ({ loadId })) },
      sessionFirearms: { create: firearmIds.map((firearmId) => ({ firearmId })) },
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
