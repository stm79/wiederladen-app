"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUnits } from "@/components/units/UnitProvider";
import { toDisplayValue, unitForKind } from "@/lib/units/format";
import { UNIT_LABELS } from "@/lib/units/types";
import { CATEGORICAL_COLORS, CHART_AXIS, CHART_MUTED } from "@/lib/charts/theme";

interface VelocityShotChartProps {
  shots: { shotNumber: number; velocityMps: number }[];
}

export function VelocityShotChart({ shots }: VelocityShotChartProps) {
  const { prefs } = useUnits();
  const unit = unitForKind("velocity", prefs);

  const data = shots
    .slice()
    .sort((a, b) => a.shotNumber - b.shotNumber)
    .map((s) => ({
      shot: s.shotNumber,
      velocity: toDisplayValue("velocity", s.velocityMps, prefs),
    }));

  if (data.length < 2) return null;

  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="shot"
            tick={{ fill: CHART_MUTED, fontSize: 11 }}
            stroke={CHART_AXIS}
            tickLine={false}
            axisLine={{ stroke: CHART_AXIS }}
          />
          <YAxis
            width={36}
            tick={{ fill: CHART_MUTED, fontSize: 11 }}
            stroke={CHART_AXIS}
            tickLine={false}
            axisLine={false}
            // Whole-number bounds — "dataMin - 2" on raw floats otherwise yields
            // ticks like 803.37058 that overflow the axis width.
            domain={[(min: number) => Math.floor(min - 2), (max: number) => Math.ceil(max + 2)]}
            allowDecimals={false}
            tickFormatter={(v: number) => String(Math.round(v))}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)} ${UNIT_LABELS[unit]}`, "Geschwindigkeit"]}
            labelFormatter={(shot) => `Schuss ${shot}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke={CATEGORICAL_COLORS[0]}
            strokeWidth={2}
            dot={{ r: 3.5, fill: CATEGORICAL_COLORS[0], strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
