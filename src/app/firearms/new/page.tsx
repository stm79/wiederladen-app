import { FirearmForm } from "@/components/forms/FirearmForm";

export default function NewFirearmPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Neue Waffe</h1>
      <FirearmForm />
    </div>
  );
}
