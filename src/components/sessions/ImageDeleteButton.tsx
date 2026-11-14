"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGroupImageAction } from "@/app/actions/images";
import { Icon } from "@/components/ui/Icon";

export function ImageDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Dieses Bild wirklich löschen?")) return;
        startTransition(async () => {
          await deleteGroupImageAction(id);
          router.refresh();
        });
      }}
      aria-label="Bild löschen"
      title="Bild löschen"
      className="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white hover:bg-red-600 disabled:opacity-50"
    >
      <Icon name="x" size={13} />
    </button>
  );
}
