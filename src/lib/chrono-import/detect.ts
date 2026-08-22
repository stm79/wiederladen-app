import Papa from "papaparse";
import type { ChronoParser, DetectedFormat, RawTable } from "./types";
import { labradarParser } from "./labradar";
import { garminXeroParser } from "./garmin-xero";
import { magnetoSpeedParser } from "./magnetospeed";

const BRANDED_PARSERS: ChronoParser[] = [labradarParser, garminXeroParser, magnetoSpeedParser];

const VELOCITY_KEYWORDS = ["velocity", "geschwindigkeit", "tempo", "speed", "v0", "m/s", "mps", "fps"];
const SHOT_KEYWORDS = ["schuss", "shot", "rec", "index", "nr", "no.", "#"];

function findColumn(headers: string[], keywords: string[]): number | null {
  const lower = headers.map((h) => h.toLowerCase());
  for (const keyword of keywords) {
    const idx = lower.findIndex((h) => h.includes(keyword));
    if (idx !== -1) return idx;
  }
  return null;
}

function guessVelocityUnit(headers: string[], velocityColumn: number): "mps" | "fps" {
  return headers[velocityColumn].toLowerCase().includes("fps") ? "fps" : "mps";
}

function genericFromTable(table: RawTable, fileName: string): DetectedFormat {
  const velocityColumn = findColumn(table.headers, VELOCITY_KEYWORDS);
  if (velocityColumn == null) {
    return {
      id: "generic",
      label: "Generisches CSV/Excel",
      confidence: "low",
      series: [{ id: "main", label: fileName, table, suggestedMapping: null }],
    };
  }

  const shotNumberColumn = findColumn(table.headers, SHOT_KEYWORDS);

  return {
    id: "generic",
    label: "Generisches CSV/Excel",
    confidence: "low",
    series: [
      {
        id: "main",
        label: fileName,
        table,
        suggestedMapping: {
          shotNumberColumn,
          velocityColumn,
          velocityUnit: guessVelocityUnit(table.headers, velocityColumn),
        },
      },
    ],
  };
}

/** For CSV/text files: tries each branded parser's own text-based extraction
 *  first (they know their own quirky block structure), then falls back to a
 *  naive first-row-is-header parse with fuzzy column guessing. */
export function detectCsvFormat(text: string, fileName: string): DetectedFormat {
  for (const parser of BRANDED_PARSERS) {
    const result = parser.detect(text, fileName);
    if (result) {
      return { id: parser.id, label: parser.label, confidence: "high", series: result.series };
    }
  }

  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true }).data;
  const [headerRow, ...rows] = parsed;
  return genericFromTable({ headers: headerRow ?? [], rows }, fileName);
}

/** For Excel files: none of the supported brands export .xlsx in practice,
 *  so we go straight to the generic fuzzy mapper on the parsed sheet. */
export function detectExcelFormat(table: RawTable, fileName: string): DetectedFormat {
  return genericFromTable(table, fileName);
}
