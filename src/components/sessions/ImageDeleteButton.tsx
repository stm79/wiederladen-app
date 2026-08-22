"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGroupImageAction } from "@/app/actions/images";

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
      className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white hover:bg-black/80 disabled:opacity-50"
    >
      {isPending ? "…" : "✕"}
    </button>
  );
}
