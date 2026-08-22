"use client";

import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUnits } from "@/components/units/UnitProvider";
import { toDisplayValue, unitForKind } from "@/lib/units/format";
import { UNIT_LABELS } from "@/lib/units/types";
import { assignSeriesColors, ALL_PAIRS_SERIES_CAP, CHART_AXIS, CHART_GRID, CHART_MUTED } from "@/lib/charts/theme";

interface LadderPoint {
  /** Groups charge steps into one ladder — typically the powder (brand+type),
   *  since a ladder test varies only charge weight within one recipe. */
  seriesKey: string;
  seriesLabel: string;
  chargeGrains: number;
  velocityMps: number;
}

export function LadderChart({ points }: { points: LadderPoint[] }) {
  const { prefs } = useUnits();
  const weightUnit = unitForKind("weight", prefs);
  const velocityUnit = unitForKind("velocity", prefs);

  const seriesKeys = useMemo(() => Array.from(new Set(points.map((p) => p.seriesKey))), [points]);
  const colors = useMemo(() => assignSeriesColors(seriesKeys, ALL_PAIRS_SERIES_CAP), [seriesKeys]);
  const labels = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of points) m.set(p.seriesKey, p.seriesLabel);
    return m;
  }, [points]);

  const series = seriesKeys.map((key) => ({
    key,
    label: labels.get(key) ?? "Ladung",
    color: colors.get(key)!,
    data: points
      .filter((p) => p.seriesKey === key)
      .map((p) => ({
        charge: toDisplayValue("weight", p.chargeGrains, prefs),
        velocity: toDisplayValue("velocity", p.velocityMps, prefs),
      }))
      .sort((a, b) => a.charge - b.charge),
  }));

  if (points.length === 0) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="0" />
          <XAxis
            type="number"
            dataKey="charge"
            name="Ladungsmenge"
            unit={` ${UNIT_LABELS[weightUnit]}`}
            tick={{ fill: CHART_MUTED, fontSize: 12 }}
            stroke={CHART_AXIS}
            tickLine={false}
            domain={["dataMin - 0.2", "dataMax + 0.2"]}
            allowDuplicatedCategory={false}
          />
          <YAxis
            type="number"
            dataKey="velocity"
            name="Geschwindigkeit"
            unit={` ${UNIT_LABELS[velocityUnit]}`}
            tick={{ fill: CHART_MUTED, fontSize: 12 }}
            stroke={CHART_AXIS}
            tickLine={false}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip
            cursor={{ strokeDasharray: "0" }}
            formatter={(value, name) =>
              name === "charge"
                ? [`${Number(value).toFixed(2)} ${UNIT_LABELS[weightUnit]}`, "Ladung"]
                : [`${Number(value).toFixed(1)} ${UNIT_LABELS[velocityUnit]}`, "Geschwindigkeit"]
            }
            contentStyle={{ fontSize: 12 }}
          />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Line
              key={s.key}
              name={s.label}
              data={s.data}
              dataKey="velocity"
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 4, fill: s.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
