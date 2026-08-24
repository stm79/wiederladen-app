import { FirearmForm } from "@/components/forms/FirearmForm";
import { getKnownCalibers } from "@/lib/firearms/distinct-values";

// Depends on calibers already used by existing firearms, which aren't
// revalidated from this route — always render fresh.
export const dynamic = "force-dynamic";

export default async function NewFirearmPage() {
  const knownCalibers = await getKnownCalibers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Neue Waffe</h1>
      <FirearmForm knownCalibers={knownCalibers} />
    </div>
  );
}
