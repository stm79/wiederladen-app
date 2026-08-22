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
    <div className="flex items-center gap-2">
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
        className={
          className ??
          "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        }
      />
      <div className="flex shrink-0 overflow-hidden rounded-md border border-neutral-300 text-xs dark:border-neutral-700">
        {KIND_UNIT_PAIR[kind].map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => switchUnit(u)}
            title={`Für dieses Feld auf ${UNIT_LABELS[u]} umschalten`}
            className={
              u === unit
                ? "bg-neutral-900 px-1.5 py-1.5 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "px-1.5 py-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
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
