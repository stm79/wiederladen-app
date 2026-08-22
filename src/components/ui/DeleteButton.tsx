"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeleteButton({
  id,
  confirmMessage,
  action,
  redirectTo,
}: {
  id: string;
  confirmMessage: string;
  action: (id: string) => Promise<unknown>;
  redirectTo: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="danger"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(confirmMessage)) return;
          setError(null);
          startTransition(async () => {
            try {
              await action(id);
              router.push(redirectTo);
              router.refresh();
            } catch {
              setError("Löschen fehlgeschlagen.");
            }
          });
        }}
      >
        {isPending ? "Löschen…" : "Löschen"}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
