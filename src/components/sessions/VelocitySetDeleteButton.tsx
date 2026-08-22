"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVelocitySet } from "@/app/actions/chrono";

export function VelocitySetDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Diesen Chrono-Datensatz wirklich löschen?")) return;
        startTransition(async () => {
          await deleteVelocitySet(id);
          router.refresh();
        });
      }}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Löschen…" : "Löschen"}
    </button>
  );
}
