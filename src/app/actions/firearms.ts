"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { firearmSchema, FIREARM_OPTIONAL_TEXT_FIELDS, type FirearmInput } from "@/lib/validation/firearm";
import { normalizeEmptyStrings } from "@/lib/normalize";

export async function createFirearm(input: FirearmInput) {
  const data = normalizeEmptyStrings(firearmSchema.parse(input), FIREARM_OPTIONAL_TEXT_FIELDS);
  const firearm = await prisma.firearm.create({ data });
  revalidatePath("/firearms");
  return firearm;
}

export async function updateFirearm(id: string, input: FirearmInput) {
  const data = normalizeEmptyStrings(firearmSchema.parse(input), FIREARM_OPTIONAL_TEXT_FIELDS);
  const firearm = await prisma.firearm.update({ where: { id }, data });
  revalidatePath("/firearms");
  revalidatePath(`/firearms/${id}`);
  return firearm;
}

export async function deleteFirearm(id: string) {
  await prisma.firearm.delete({ where: { id } });
  revalidatePath("/firearms");
}
