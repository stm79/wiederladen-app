"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { toggleChecklistItem } from "@/app/actions/checklist";
import { Icon } from "@/components/ui/Icon";

interface LoadChecklistProps {
  loadId: string;
  steps: { id: string; label: string }[];
  checkedStepIds: string[];
}

export function LoadChecklist({ loadId, steps, checkedStepIds }: LoadChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Optimistic copy so a tap ticks instantly instead of waiting for the refresh.
  const [optimistic, setOptimistic] = useState<{ source: string[]; ids: Set<string> }>({
    source: checkedStepIds,
    ids: new Set(checkedStepIds),
  });
  const checked = optimistic.source === checkedStepIds ? optimistic.ids : new Set(checkedStepIds);

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700">
        Noch keine Checkliste eingerichtet —{" "}
        <Link href="/settings" className="font-medium text-neutral-800 underline dark:text-neutral-200">
          in den Einstellungen anlegen
        </Link>
        .
      </div>
    );
  }

  function toggle(stepId: string, next: boolean) {
    const ids = new Set(checked);
    if (next) ids.add(stepId);
    else ids.delete(stepId);
    setOptimistic({ source: checkedStepIds, ids });
    startTransition(async () => {
      await toggleChecklistItem(loadId, stepId, next);
      router.refresh();
    });
  }

  const doneCount = steps.filter((s) => checked.has(s.id)).length;
  const allDone = doneCount === steps.length;

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="checklist" size={17} className="text-neutral-400" />
          Checkliste
        </h2>
        <span
          className={clsx(
            "text-xs font-medium tabular-nums",
            allDone ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500"
          )}
        >
          {allDone ? "Fertig" : `${doneCount} / ${steps.length}`}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className={clsx("h-full rounded-full transition-all", allDone ? "bg-emerald-500" : "bg-brand")}
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <ul className="mt-3 flex flex-col">
        {steps.map((step) => {
          const isChecked = checked.has(step.id);
          return (
            <li key={step.id}>
              <label
                className={clsx(
                  "-mx-2 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
                  isPending && "cursor-wait"
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={isChecked}
                  onChange={(e) => toggle(step.id, e.target.checked)}
                />
                <span className={isChecked ? "text-neutral-400 line-through" : ""}>{step.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
