import { PageHeader } from "@/components/ui/Layout";
import { CaseLotForm } from "@/components/forms/CaseLotForm";
import { getKnownCalibers } from "@/lib/firearms/distinct-values";

export const dynamic = "force-dynamic";

export default async function NewCaseLotPage() {
  const knownCalibers = await getKnownCalibers();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader back={{ href: "/cases", label: "Hülsen" }} title="Neue Hülsen-Charge" />
      <CaseLotForm knownCalibers={knownCalibers} />
    </div>
  );
}
