"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleChecklistItem } from "@/app/actions/checklist";

interface LoadChecklistProps {
  loadId: string;
  steps: { id: string; label: string }[];
  checkedStepIds: string[];
}

export function LoadChecklist({ loadId, steps, checkedStepIds }: LoadChecklistProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const checked = new Set(checkedStepIds);

  if (steps.length === 0) return null;

  function toggle(stepId: string, next: boolean) {
    startTransition(async () => {
      await toggleChecklistItem(loadId, stepId, next);
      router.refresh();
    });
  }

  const doneCount = checkedStepIds.length;

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Wiederlade-Checkliste ({doneCount}/{steps.length})
        </span>
        <span className="text-xs text-neutral-500">{open ? "Ausblenden" : "Einblenden"}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          {steps.map((step) => (
            <label key={step.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked.has(step.id)}
                disabled={isPending}
                onChange={(e) => toggle(step.id, e.target.checked)}
              />
              <span className={checked.has(step.id) ? "text-neutral-400 line-through" : ""}>{step.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

