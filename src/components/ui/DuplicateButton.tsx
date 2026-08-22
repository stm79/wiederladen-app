"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { duplicateLoad } from "@/app/actions/loads";

export function DuplicateButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const result = await duplicateLoad(id);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              router.push(`/loads/${result.load.id}`);
              router.refresh();
            } catch {
              setError("Duplizieren fehlgeschlagen.");
            }
          });
        }}
      >
        {isPending ? "Duplizieren…" : "Duplizieren als Basis"}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
