"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type Load } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loadSchema, LOAD_OPTIONAL_TEXT_FIELDS, type LoadInput } from "@/lib/validation/load";
import { normalizeEmptyStrings } from "@/lib/normalize";
import { indexToVariantLetter } from "@/lib/loads/variant-letter";

export type LoadActionResult = { ok: true; load: Load } | { ok: false; error: string };

// Server Action errors get masked to a generic message in production builds —
// returning a plain result object instead of throwing is what lets a specific,
// user-actionable message (e.g. the uniqueness conflict below) actually reach
// the form in both dev and production.
function friendlyError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Diese Ladungsnummer mit dieser Variante gibt es schon.";
  }
  throw error;
}

export async function createLoad(input: LoadInput): Promise<LoadActionResult> {
  const parsed = normalizeEmptyStrings(loadSchema.parse(input), LOAD_OPTIONAL_TEXT_FIELDS);
  const data = { ...parsed, variantLetter: parsed.variantLetter.toUpperCase() };

  try {
    const load = await prisma.load.create({ data });
    revalidatePath("/loads");
    return { ok: true, load };
  } catch (error) {
    return { ok: false, error: friendlyError(error) };
  }
}

export async function updateLoad(id: string, input: LoadInput): Promise<LoadActionResult> {
  const parsed = normalizeEmptyStrings(loadSchema.parse(input), LOAD_OPTIONAL_TEXT_FIELDS);
  const data = { ...parsed, variantLetter: parsed.variantLetter.toUpperCase() };

  try {
    const load = await prisma.load.update({ where: { id }, data });
    revalidatePath("/loads");
    revalidatePath(`/loads/${id}`);
    return { ok: true, load };
  } catch (error) {
    return { ok: false, error: friendlyError(error) };
  }
}

export async function deleteLoad(id: string) {
  await prisma.load.delete({ where: { id } });
  revalidatePath("/loads");
}

export async function duplicateLoad(id: string): Promise<LoadActionResult> {
  const source = await prisma.load.findUniqueOrThrow({ where: { id } });

  // Duplicates stay in the same "load family" (same base loadNumber) and get
  // the next sequential variant letter (A = the original, B/C/... = each
  // duplicate), regardless of how deep the duplicate-of-a-duplicate chain is.
  // Both remain editable afterward if this guess doesn't match the user's
  // own numbering.
  const siblingCount = await prisma.load.count({ where: { loadNumber: source.loadNumber } });
  // An unlettered source doesn't occupy an "A" slot, so the first copy of one
  // starts at "A" instead of "B".
  const variantLetter = indexToVariantLetter(source.variantLetter ? siblingCount : siblingCount - 1);

  try {
    const copy = await prisma.load.create({
      data: {
        loadNumber: source.loadNumber,
        variantLetter,
        name: source.name ? `${source.name} (Kopie)` : null,
        firearmId: source.firearmId,
        caseBrand: source.caseBrand,
        caseLoadCount: source.caseLoadCount,
        sizingDie: source.sizingDie,
        shoulderBumpMm: source.shoulderBumpMm,
        bushingDiameterMm: source.bushingDiameterMm,
        mandrelDiameterMm: source.mandrelDiameterMm,
        primer: source.primer,
        powder: source.powder,
        chargeGrains: source.chargeGrains,
        bullet: source.bullet,
        bulletWeightGr: source.bulletWeightGr,
        oalMm: source.oalMm,
        cbtoMm: source.cbtoMm,
        crimpInfo: source.crimpInfo,
        notes: source.notes,
        parentLoadId: source.id,
      },
    });
    revalidatePath("/loads");
    return { ok: true, load: copy };
  } catch (error) {
    return { ok: false, error: friendlyError(error) };
  }
}
