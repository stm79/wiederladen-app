import { prisma } from "@/lib/prisma";
import { DEFAULT_UNIT_PREFERENCES, type UnitPreferences } from "@/lib/units/types";

export async function getUnitPreferences(): Promise<UnitPreferences> {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_UNIT_PREFERENCES },
  });

  return {
    weightUnit: settings.weightUnit as UnitPreferences["weightUnit"],
    lengthUnit: settings.lengthUnit as UnitPreferences["lengthUnit"],
    velocityUnit: settings.velocityUnit as UnitPreferences["velocityUnit"],
  };
}

export async function updateUnitPreferences(
  prefs: Partial<UnitPreferences>
): Promise<UnitPreferences> {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: prefs,
    create: { id: 1, ...DEFAULT_UNIT_PREFERENCES, ...prefs },
  });

  return {
    weightUnit: settings.weightUnit as UnitPreferences["weightUnit"],
    lengthUnit: settings.lengthUnit as UnitPreferences["lengthUnit"],
    velocityUnit: settings.velocityUnit as UnitPreferences["velocityUnit"],
  };
}
