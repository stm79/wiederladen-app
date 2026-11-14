"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteShotGroup } from "@/app/actions/groups";
import { Icon } from "@/components/ui/Icon";

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
      aria-label="Gruppe löschen"
      title="Gruppe löschen"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
    >
      <Icon name="trash" size={15} />
    </button>
  );
}
