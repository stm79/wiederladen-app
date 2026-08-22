import Papa from "papaparse";

/** Converts an array of flat objects to a CSV string (comma-delimited, header row included). */
export function objectsToCsv(rows: Record<string, unknown>[]): string {
  return Papa.unparse(rows);
}
