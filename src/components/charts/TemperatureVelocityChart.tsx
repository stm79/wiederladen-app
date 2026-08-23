"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { useUnits } from "@/components/units/UnitProvider";
import { toDisplayValue, unitForKind } from "@/lib/units/format";
import { UNIT_LABELS } from "@/lib/units/types";
import { CATEGORICAL_COLORS, CHART_AXIS, CHART_GRID, CHART_MUTED } from "@/lib/charts/theme";

interface TemperaturePoint {
  tempC: number;
  avgMps: number;
  date: Date;
  location: string | null;
}

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

/** One load, one point per session — a single series, so a single accent
 *  color with no legend is correct (dataviz skill: 1 series needs no legend
 *  box, the title already names it). */
export function TemperatureVelocityChart({ points }: { points: TemperaturePoint[] }) {
  const { prefs } = useUnits();
  const velocityUnit = unitForKind("velocity", prefs);

  const data = points.map((p) => ({
    tempC: p.tempC,
    velocity: toDisplayValue("velocity", p.avgMps, prefs),
    date: p.date,
    location: p.location,
  }));

  if (data.length === 0) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="0" />
          <XAxis
            type="number"
            dataKey="tempC"
            name="Temperatur"
            unit=" °C"
            tick={{ fill: CHART_MUTED, fontSize: 12 }}
            stroke={CHART_AXIS}
            tickLine={false}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <YAxis
            type="number"
            dataKey="velocity"
            name="Ø Geschwindigkeit"
            unit={` ${UNIT_LABELS[velocityUnit]}`}
            tick={{ fill: CHART_MUTED, fontSize: 12 }}
            stroke={CHART_AXIS}
            tickLine={false}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip
            cursor={{ strokeDasharray: "0" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="font-medium">
                    {DATE_FORMAT.format(p.date)}
                    {p.location ? ` – ${p.location}` : ""}
                  </div>
                  <div className="text-neutral-500">{p.tempC.toFixed(1)} °C</div>
                  <div className="text-neutral-500">
                    {p.velocity.toFixed(1)} {UNIT_LABELS[velocityUnit]}
                  </div>
                </div>
              );
            }}
          />
          <Scatter data={data} fill={CATEGORICAL_COLORS[0]} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
