"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUnits } from "@/components/units/UnitProvider";
import { toDisplayValue, unitForKind } from "@/lib/units/format";
import { UNIT_LABELS } from "@/lib/units/types";
import { CATEGORICAL_COLORS, CHART_AXIS, CHART_GRID, CHART_MUTED } from "@/lib/charts/theme";

interface ConsistencyPoint {
  loadLabel: string;
  sdMps: number | null;
  esMps: number | null;
}

/** Grouped bar: SD and ES are two distinct series (not "many categories"),
 *  so categorical color + legend applies, not a single sequential hue. */
export function VelocityConsistencyChart({ points }: { points: ConsistencyPoint[] }) {
  const { prefs } = useUnits();
  const velocityUnit = unitForKind("velocity", prefs);

  const data = points
    .filter((p) => p.sdMps != null || p.esMps != null)
    .map((p) => ({
      loadLabel: p.loadLabel,
      sd: p.sdMps != null ? toDisplayValue("velocity", p.sdMps, prefs) : null,
      es: p.esMps != null ? toDisplayValue("velocity", p.esMps, prefs) : null,
    }));

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
            unit={` ${UNIT_LABELS[velocityUnit]}`}
          />
          <Tooltip
            formatter={(value) => `${Number(value).toFixed(1)} ${UNIT_LABELS[velocityUnit]}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="sd" name="SD" fill={CATEGORICAL_COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="es" name="Extreme Spread" fill={CATEGORICAL_COLORS[1]} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
