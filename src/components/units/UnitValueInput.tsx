"use client";

import { useEffect, useState } from "react";
import { useUnits } from "./UnitProvider";
import {
  toCanonicalValueForUnit,
  toDisplayValueForUnit,
  unitForKind,
  KIND_UNIT_PAIR,
  type UnitKind,
  type AnyUnit,
} from "@/lib/units/format";
import { UNIT_LABELS } from "@/lib/units/types";
import { inputClass } from "@/components/forms/FormField";

interface UnitValueInputProps {
  kind: UnitKind;
  /** Canonical value (grains / mm / m/s), or null/undefined if empty. */
  value: number | null | undefined;
  onChange: (canonicalValue: number | null) => void;
  id?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

function storageKey(id: string): string {
  return `wiederladen:unit:${id}`;
}

/**
 * A numeric input for a canonical (grain/mm/m·s⁻¹) value, with a small
 * per-field unit switch. The switch starts at the global default (Settings),
 * but once flipped for a given field (by its `id`, e.g. "oalMm"), that choice
 * is remembered in this browser for that field going forward — across every
 * load/record, not just the one being edited right now — and re-displays
 * whatever value is already entered in the restored unit without changing
 * the stored (canonical) value.
 */
export function UnitValueInput({
  kind,
  value,
  onChange,
  id,
  placeholder,
  required,
  className,
}: UnitValueInputProps) {
  const { prefs } = useUnits();
  const [unit, setUnit] = useState<AnyUnit>(() => unitForKind(kind, prefs));
  const [text, setText] = useState(() =>
    value == null ? "" : trimNumber(toDisplayValueForUnit(kind, value, unit))
  );

  // Restore a per-field unit choice saved in a previous visit. Done in an
  // effect (not the initial state) so server and first client render match —
  // localStorage isn't available during SSR — then this corrects it once
  // right after mount.
  useEffect(() => {
    if (!id) return;
    const stored = window.localStorage.getItem(storageKey(id));
    const isValidUnit = (KIND_UNIT_PAIR[kind] as readonly string[]).includes(stored ?? "");
    if (stored && isValidUnit && stored !== unit) {
      const restored = stored as AnyUnit;
      // Legitimate one-time sync from an external store (localStorage) on
      // mount, not derived-state-from-props — SSR has no localStorage, so
      // this can't be the initial useState value without a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnit(restored);
      setText(value == null ? "" : trimNumber(toDisplayValueForUnit(kind, value, restored)));
    }
    // Only restore once, right after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchUnit(next: AnyUnit) {
    if (next !== unit) {
      setUnit(next);
      setText(value == null ? "" : trimNumber(toDisplayValueForUnit(kind, value, next)));
    }
    if (id) window.localStorage.setItem(storageKey(id), next);
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        id={id}
        type="number"
        step="any"
        inputMode="decimal"
        required={required}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          if (raw.trim() === "") {
            onChange(null);
            return;
          }
          const num = Number(raw);
          if (!Number.isNaN(num)) {
            onChange(toCanonicalValueForUnit(kind, num, unit));
          }
        }}
        className={className ?? `${inputClass} min-w-0 tabular-nums`}
      />
      <div className="flex h-10 shrink-0 items-center gap-0.5 rounded-lg bg-neutral-100 p-1 text-xs dark:bg-neutral-800">
        {KIND_UNIT_PAIR[kind].map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => switchUnit(u)}
            title={`Für dieses Feld auf ${UNIT_LABELS[u]} umschalten`}
            className={
              u === unit
                ? "h-full min-w-8 rounded-md bg-white px-2 font-semibold text-neutral-900 shadow-xs dark:bg-neutral-950 dark:text-white"
                : "h-full min-w-8 rounded-md px-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }
          >
            {UNIT_LABELS[u]}
          </button>
        ))}
      </div>
    </div>
  );
}

function trimNumber(n: number): string {
  return Number(n.toFixed(4)).toString();
}
