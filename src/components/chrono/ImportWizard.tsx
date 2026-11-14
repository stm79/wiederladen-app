"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commitVelocityImport } from "@/app/actions/chrono";
import { ChronoFileImport, type ChronoImportResult } from "@/components/chrono/ChronoFileImport";
import { Button } from "@/components/ui/Button";

interface ImportWizardProps {
  groupId: string;
  sessionId: string;
}

export function ImportWizard({ groupId, sessionId }: ImportWizardProps) {
  const router = useRouter();
  const [result, setResult] = useState<ChronoImportResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCommit() {
    if (!result) return;
    setIsSaving(true);
    setError(null);
    try {
      await commitVelocityImport({ groupId, ...result });
      router.push(`/sessions/${sessionId}`);
      router.refresh();
    } catch {
      setError("Import fehlgeschlagen.");
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <ChronoFileImport onChange={setResult} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="flex gap-2">
          <Button type="button" icon="check" disabled={isSaving} onClick={handleCommit}>
            {isSaving ? "Importieren…" : `${result.shots.length} Schuss importieren`}
          </Button>
        </div>
      )}
    </div>
  );
}
