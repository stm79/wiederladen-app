import Papa from "papaparse";
import type { ChronoParser, RawTable, SeriesOption, VelocitySourceUnit } from "./types";

/**
 * MagnetoSpeed (Sporter/V3) export — verified against real sample files.
 * A single file bundles one block per "series" (one per load/string tested
 * that session): a `Series,<no>, Shots:,<count>` summary line, min/max/avg/
 * SD/ES stats (recomputed by us anyway, not trusted from the file), a
 * `Series,Shot,Speed` sub-header, then shot rows `<series>,<shot>,<speed>,
 * <unit>`, terminated by a `----,----,----,----` separator. We surface every
 * series as a pickable option since a file usually covers several loads.
 */
export const magnetoSpeedParser: ChronoParser = {
  id: "magnetospeed",
  label: "MagnetoSpeed (Sporter/V3)",
  detect(text) {
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true }).data.map((row) =>
      row.map((c) => c.trim())
    );

    const series: SeriesOption[] = [];
    let i = 0;
    while (i < parsed.length) {
      const seriesHeader = parseSeriesHeaderRow(parsed[i]);
      if (!seriesHeader) {
        i++;
        continue;
      }

      let j = i + 1;
      while (j < parsed.length && !isShotTableHeaderRow(parsed[j])) j++;
      if (j >= parsed.length) break;

      const rows: string[][] = [];
      let k = j + 1;
      while (k < parsed.length && !isSeparatorRow(parsed[k]) && !parseSeriesHeaderRow(parsed[k])) {
        rows.push(parsed[k]);
        k++;
      }

      if (rows.length > 0) {
        const unit: VelocitySourceUnit = /fps/i.test(rows[0]?.[3] ?? "") ? "fps" : "mps";
        const table: RawTable = { headers: ["Serie", "Schuss", "Geschwindigkeit", "Einheit"], rows };
        series.push({
          id: seriesHeader.seriesNo,
          label: `Serie ${seriesHeader.seriesNo} (${rows.length} Schuss)`,
          table,
          suggestedMapping: { shotNumberColumn: 1, velocityColumn: 2, velocityUnit: unit },
        });
      }
      i = k;
    }

    if (series.length === 0) return null;
    return { series };
  },
};

function parseSeriesHeaderRow(row: string[]): { seriesNo: string } | null {
  if (row.length < 4) return null;
  if (row[0]?.toLowerCase() !== "series") return null;
  if (!row[2]?.toLowerCase().startsWith("shots")) return null;
  return { seriesNo: row[1] ?? "" };
}

function isShotTableHeaderRow(row: string[]): boolean {
  return row[0]?.toLowerCase() === "series" && row[1]?.toLowerCase() === "shot";
}

function isSeparatorRow(row: string[]): boolean {
  return row.length > 0 && row.every((c) => /^-+$/.test(c));
}
