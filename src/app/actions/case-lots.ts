"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type CaseLot } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { caseLotSchema, CASE_LOT_OPTIONAL_TEXT_FIELDS, type CaseLotInput } from "@/lib/validation/case-lot";
import { normalizeEmptyStrings } from "@/lib/normalize";

export type CaseLotActionResult = { ok: true; lot: CaseLot } | { ok: false; error: string };

function toData(input: CaseLotInput) {
  const parsed = normalizeEmptyStrings(caseLotSchema.parse(input), CASE_LOT_OPTIONAL_TEXT_FIELDS);
  return {
    ...parsed,
    purchasedAt: parsed.purchasedAt ? new Date(parsed.purchasedAt) : null,
  };
}

export async function createCaseLot(input: CaseLotInput): Promise<CaseLotActionResult> {
  const data = toData(input);
  // Two quick creates could race for the same next number; retry once.
  for (let attempt = 0; ; attempt++) {
    const max = await prisma.caseLot.aggregate({ _max: { number: true } });
    try {
      const lot = await prisma.caseLot.create({ data: { ...data, number: (max._max.number ?? 0) + 1 } });
      revalidatePath("/cases");
      return { ok: true, lot };
    } catch (error) {
      const conflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!conflict || attempt > 0) return { ok: false, error: "Charge konnte nicht angelegt werden." };
    }
  }
}

export async function updateCaseLot(id: string, input: CaseLotInput): Promise<CaseLotActionResult> {
  const lot = await prisma.caseLot.update({ where: { id }, data: toData(input) });
  revalidatePath("/cases");
  revalidatePath(`/cases/${id}`);
  return { ok: true, lot };
}

/** Loads keep their recipe; they just lose the link to the lot. */
export async function deleteCaseLot(id: string) {
  await prisma.caseLot.delete({ where: { id } });
  revalidatePath("/cases");
  revalidatePath("/loads");
}
