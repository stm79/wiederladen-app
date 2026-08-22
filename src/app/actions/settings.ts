"use server";

import { revalidatePath } from "next/cache";
import { updateUnitPreferences } from "@/lib/settings";
import type { UnitPreferences } from "@/lib/units/types";

export async function saveUnitPreferences(prefs: UnitPreferences) {
  const updated = await updateUnitPreferences(prefs);
  revalidatePath("/", "layout");
  return updated;
}
