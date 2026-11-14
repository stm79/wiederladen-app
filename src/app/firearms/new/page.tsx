import { PageHeader } from "@/components/ui/Layout";
import { FirearmForm } from "@/components/forms/FirearmForm";
import { getKnownCalibers } from "@/lib/firearms/distinct-values";

// Depends on calibers already used by existing firearms, which aren't
// revalidated from this route — always render fresh.
export const dynamic = "force-dynamic";

export default async function NewFirearmPage() {
  const knownCalibers = await getKnownCalibers();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader back={{ href: "/firearms", label: "Waffen" }} title="Neue Waffe" />
      <FirearmForm knownCalibers={knownCalibers} />
    </div>
  );
}
