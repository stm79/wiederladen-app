"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUnits } from "@/components/units/UnitProvider";
import { toDisplayValue, unitForKind } from "@/lib/units/format";
import { UNIT_LABELS } from "@/lib/units/types";
import { CATEGORICAL_COLORS, CHART_AXIS, CHART_GRID, CHART_MUTED } from "@/lib/charts/theme";

interface SessionVelocityPoint {
  label: string;
  avgMps: number;
}

/** One load's average velocity (v0) per session, in session order — a single
 *  series, so one accent color and no legend (the card title names it). */
export function SessionVelocityChart({ points }: { points: SessionVelocityPoint[] }) {
  const { prefs } = useUnits();
  const velocityUnit = unitForKind("velocity", prefs);
  const unit = UNIT_LABELS[velocityUnit];

  const data = points.map((p) => ({ label: p.label, velocity: toDisplayValue("velocity", p.avgMps, prefs) }));
  if (data.length === 0) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_MUTED, fontSize: 11 }}
            stroke={CHART_AXIS}
            tickLine={false}
            height={30}
            padding={{ left: 16, right: 16 }}
          />
          <YAxis
            tick={{ fill: CHART_MUTED, fontSize: 12 }}
            stroke={CHART_AXIS}
            tickLine={false}
            unit={` ${unit}`}
            width={72}
            domain={[(min: number) => Math.floor(min - 5), (max: number) => Math.ceil(max + 5)]}
            tickFormatter={(v: number) => String(Math.round(v))}
          />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} ${unit}`, "Ø Geschw."]} contentStyle={{ fontSize: 12 }} />
          <Line
            type="linear"
            dataKey="velocity"
            stroke={CATEGORICAL_COLORS[0]}
            strokeWidth={2}
            dot={{ r: 4, fill: CATEGORICAL_COLORS[0] }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
