"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVelocitySet } from "@/app/actions/chrono";
import { Icon } from "@/components/ui/Icon";

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
      aria-label="Chrono-Datensatz löschen"
      title="Chrono-Datensatz löschen"
      className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
    >
      <Icon name="trash" size={14} />
    </button>
  );
}
