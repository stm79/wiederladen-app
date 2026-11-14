import type { RawTable } from "./types";
import { readFirstSheet } from "./xlsx";

export function isExcelFile(fileName: string): boolean {
  const name = fileName.toLowerCase();
  return name.endsWith(".xlsx") || name.endsWith(".xls");
}

/** First sheet of an .xlsx file as header row + data rows. Legacy binary
 *  .xls isn't readable (never was) — that throws, and the import UI reports
 *  "Datei konnte nicht gelesen werden". */
export async function parseExcelTable(file: File): Promise<RawTable> {
  const allRows = readFirstSheet(new Uint8Array(await file.arrayBuffer()));
  const [headerRow, ...rows] = allRows;
  return { headers: headerRow ?? [], rows };
}
