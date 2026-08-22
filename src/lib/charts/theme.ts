/** Categorical series colors, in fixed CVD-safe order — always assign by this
 *  order, never cycle/generate. Reference: dataviz skill's validated default
 *  palette (see src/app/globals.css for the light/dark CSS custom properties
 *  these reference). */
export const CATEGORICAL_COLORS = [
  "var(--chart-series-1)",
  "var(--chart-series-2)",
  "var(--chart-series-3)",
  "var(--chart-series-4)",
  "var(--chart-series-5)",
  "var(--chart-series-6)",
  "var(--chart-series-7)",
  "var(--chart-series-8)",
] as const;

export const OTHER_COLOR = "var(--chart-other)";

export const CHART_GRID = "var(--chart-grid)";
export const CHART_AXIS = "var(--chart-axis)";
export const CHART_MUTED = "var(--chart-muted)";
export const CHART_TEXT_SECONDARY = "var(--chart-text-secondary)";

/** All-pairs chart forms (scatter, bubble, small multiples) only validate the
 *  first 3 categorical slots together — past that, fold the tail into "Other"
 *  rather than seat a 4th distinct hue (dataviz skill, series-count ladder). */
export const ALL_PAIRS_SERIES_CAP = 3;

/**
 * Assigns fixed-order categorical colors to a list of series keys, folding
 * anything past `cap` into a shared "Other" color/label.
 */
export function assignSeriesColors<T extends string>(
  keys: T[],
  cap: number = CATEGORICAL_COLORS.length
): Map<T, string> {
  const map = new Map<T, string>();
  keys.forEach((key, i) => {
    map.set(key, i < cap ? CATEGORICAL_COLORS[i] : OTHER_COLOR);
  });
  return map;
}
