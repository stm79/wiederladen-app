"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createChecklistStep,
  deleteChecklistStep,
  reorderChecklistSteps,
  updateChecklistStep,
} from "@/app/actions/checklist";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/forms/FormField";
import { Icon } from "@/components/ui/Icon";

interface ChecklistStepsManagerProps {
  steps: { id: string; label: string }[];
}

export function ChecklistStepsManager({ steps }: ChecklistStepsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newLabel, setNewLabel] = useState("");
  const newLabelInputRef = useRef<HTMLInputElement>(null);

  function addStep() {
    const label = newLabel.trim();
    if (!label) return;
    startTransition(async () => {
      await createChecklistStep(label);
      setNewLabel("");
      router.refresh();
      newLabelInputRef.current?.focus();
    });
  }

  function renameStep(id: string, label: string) {
    startTransition(async () => {
      await updateChecklistStep(id, label);
      router.refresh();
    });
  }

  function removeStep(id: string) {
    startTransition(async () => {
      await deleteChecklistStep(id);
      router.refresh();
    });
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    startTransition(async () => {
      await reorderChecklistSteps(reordered.map((s) => s.id));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {steps.length === 0 ? (
        <p className="text-sm text-neutral-500">Noch keine Schritte angelegt.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-1.5">
              <span className="w-5 shrink-0 text-right text-xs tabular-nums text-neutral-400">{index + 1}.</span>
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  disabled={isPending || index === 0}
                  onClick={() => moveStep(index, -1)}
                  className="flex h-5 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  aria-label="Nach oben"
                >
                  <Icon name="chevronDown" size={14} className="rotate-180" />
                </button>
                <button
                  type="button"
                  disabled={isPending || index === steps.length - 1}
                  onClick={() => moveStep(index, 1)}
                  className="flex h-5 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  aria-label="Nach unten"
                >
                  <Icon name="chevronDown" size={14} />
                </button>
              </div>
              <input
                defaultValue={step.label}
                disabled={isPending}
                className={`${inputClass} flex-1`}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== step.label) renameStep(step.id, value);
                  else if (!value) e.target.value = step.label;
                }}
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => removeStep(step.id)}
                aria-label={`Schritt "${step.label}" löschen`}
                title="Löschen"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <input
          ref={newLabelInputRef}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addStep();
            }
          }}
          placeholder='z.B. "Hülsen entkohlen"'
          disabled={isPending}
          className={`${inputClass} flex-1`}
        />
        <Button type="button" variant="secondary" icon="plus" disabled={isPending || !newLabel.trim()} onClick={addStep}>
          Hinzufügen
        </Button>
      </div>
    </div>
  );
}
