"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteShotGroup } from "@/app/actions/groups";

export function GroupDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Diese Schussgruppe wirklich löschen?")) return;
        startTransition(async () => {
          await deleteShotGroup(id);
          router.refresh();
        });
      }}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Löschen…" : "Gruppe löschen"}
    </button>
  );
}
