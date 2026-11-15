"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cloneLoad, type CloneMode } from "@/app/actions/loads";

const OPTIONS: { mode: CloneMode; label: string; hint: string }[] = [
  { mode: "variant", label: "Als Variante", hint: "Gleiche Ladungsnummer, nächster Buchstabe" },
  { mode: "new", label: "Als neue Ladung", hint: "Nächste freie Ladungsnummer" },
];

/** "Ladung clonen" with a small menu: copy all values into a new variant of
 *  this load or into a new load with its own number. */
export function CloneLoadButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function clone(mode: CloneMode) {
    setOpen(false);
    setError(null);
    startTransition(async () => {
      try {
        const result = await cloneLoad(id, mode);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(`/loads/${result.load.id}`);
        router.refresh();
      } catch {
        setError("Clonen fehlgeschlagen.");
      }
    });
  }

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1">
      <Button
        type="button"
        variant="secondary"
        icon="copy"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={isPending}
        onClick={() => setOpen((o) => !o)}
      >
        {isPending ? "Clonen…" : "Ladung clonen"}
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 z-20 mt-1 w-64 overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              role="menuitem"
              onClick={() => clone(opt.mode)}
              className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span className="text-sm font-medium text-neutral-900 dark:text-white">{opt.label}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{opt.hint}</span>
            </button>
          ))}
        </div>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
