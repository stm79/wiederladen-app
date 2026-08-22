export interface RawTable {
  headers: string[];
  /** All data rows (header row excluded), as raw string cells. */
  rows: string[][];
}

export type VelocitySourceUnit = "mps" | "fps";

export interface ColumnMapping {
  /** Header index to read the shot number from, or null to auto-number 1..n in row order. */
  shotNumberColumn: number | null;
  /** Header index to read velocity from. */
  velocityColumn: number;
  velocityUnit: VelocitySourceUnit;
}

export interface ParsedShot {
  shotNumber: number;
  velocityMps: number;
}

/** One shot-string extracted from a file. Most formats have exactly one;
 *  MagnetoSpeed files can bundle several (one per load tested that day), so
 *  the user picks which one to import. */
export interface SeriesOption {
  id: string;
  label: string;
  table: RawTable;
  /** Null only for the generic fallback when no velocity-like column could be guessed. */
  suggestedMapping: ColumnMapping | null;
}

export interface DetectedFormat {
  /** "labradar" | "garmin-xero" | "magnetospeed" | "generic" */
  id: string;
  label: string;
  /** "high" only for an unambiguous branded-format signature match; "low" for the generic fallback. */
  confidence: "high" | "low";
  series: SeriesOption[];
}

export interface ChronoParser {
  id: string;
  label: string;
  /** Returns the shot-string(s) found if this parser recognizes the file, otherwise null. */
  detect(text: string, fileName: string): { series: SeriesOption[] } | null;
}
