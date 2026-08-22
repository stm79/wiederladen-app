"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUnits } from "@/components/units/UnitProvider";
import { toDisplayValue, unitForKind } from "@/lib/units/format";
import { UNIT_LABELS } from "@/lib/units/types";
import { CATEGORICAL_COLORS, CHART_AXIS, CHART_GRID, CHART_MUTED } from "@/lib/charts/theme";

interface GroupSizePoint {
  loadLabel: string;
  meanExtremeSpreadMm: number | null;
}

/** A single metric compared across many named loads — magnitude comparison,
 *  so one sequential hue, not a categorical palette (dataviz skill: "compare
 *  magnitude, low -> high" -> bar chart, one hue). */
export function GroupSizeComparisonChart({ points }: { points: GroupSizePoint[] }) {
  const { prefs } = useUnits();
  const lengthUnit = unitForKind("length", prefs);

  const data = points
    .filter((p) => p.meanExtremeSpreadMm != null)
    .map((p) => ({
      loadLabel: p.loadLabel,
      extremeSpread: toDisplayValue("length", p.meanExtremeSpreadMm!, prefs),
    }))
    .sort((a, b) => a.extremeSpread - b.extremeSpread);

  if (data.length === 0) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="loadLabel"
            tick={{ fill: CHART_MUTED, fontSize: 11 }}
            stroke={CHART_AXIS}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: CHART_MUTED, fontSize: 12 }}
            stroke={CHART_AXIS}
            tickLine={false}
            unit={` ${UNIT_LABELS[lengthUnit]}`}
          />
          <Tooltip
            formatter={(value) => `${Number(value).toFixed(1)} ${UNIT_LABELS[lengthUnit]}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="extremeSpread"
            name="Ø Extreme Spread"
            fill={CATEGORICAL_COLORS[0]}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
