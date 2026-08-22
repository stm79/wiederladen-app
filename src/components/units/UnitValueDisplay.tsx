"use client";

import { useUnits } from "./UnitProvider";
import { toDisplayValue, unitForKind, type UnitKind } from "@/lib/units/format";
import { UNIT_LABELS } from "@/lib/units/types";

interface UnitValueDisplayProps {
  kind: UnitKind;
  value: number | null | undefined;
  fractionDigits?: number;
}

export function UnitValueDisplay({ kind, value, fractionDigits = 2 }: UnitValueDisplayProps) {
  const { prefs } = useUnits();
  const unit = unitForKind(kind, prefs);

  if (value == null) {
    return <span className="text-neutral-400">—</span>;
  }

  const display = toDisplayValue(kind, value, prefs);
  return (
    <span>
      {display.toFixed(fractionDigits)} {UNIT_LABELS[unit]}
    </span>
  );
}
