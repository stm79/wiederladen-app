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
        <div className="flex flex-col gap-1">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-1">
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  disabled={isPending || index === 0}
                  onClick={() => moveStep(index, -1)}
                  className="px-1 text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-30 dark:hover:text-neutral-100"
                  aria-label="Nach oben"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={isPending || index === steps.length - 1}
                  onClick={() => moveStep(index, 1)}
                  className="px-1 text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-30 dark:hover:text-neutral-100"
                  aria-label="Nach unten"
                >
                  ▼
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
                className="shrink-0 px-2 text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
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
        <Button type="button" variant="secondary" disabled={isPending || !newLabel.trim()} onClick={addStep}>
          + Hinzufügen
        </Button>
      </div>
    </div>
  );
}
