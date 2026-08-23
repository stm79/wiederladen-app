import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const checklistSteps = await prisma.checklistStep.findMany({ orderBy: { sortOrder: "asc" } });
  return <SettingsClient checklistSteps={checklistSteps} />;
}
