"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ShotGroupForm, type ShotGroupLoadOption } from "@/components/forms/ShotGroupForm";

export function AddShotGroupSection({
  sessionId,
  loads,
}: {
  sessionId: string;
  loads: ShotGroupLoadOption[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-sm font-medium text-neutral-600 transition-colors hover:border-brand hover:bg-brand-soft/50 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white"
      >
        <Icon name="plus" size={17} />
        Neue Schussgruppe
      </button>
    );
  }

  return <ShotGroupForm sessionId={sessionId} loads={loads} onDone={() => setOpen(false)} />;
}
