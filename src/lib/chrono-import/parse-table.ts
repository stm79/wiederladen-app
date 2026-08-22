import ExcelJS from "exceljs";
import type { RawTable } from "./types";

export function isExcelFile(fileName: string): boolean {
  const name = fileName.toLowerCase();
  return name.endsWith(".xlsx") || name.endsWith(".xls");
}

export async function parseExcelTable(file: File): Promise<RawTable> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = new ExcelJS.Workbook();
  // exceljs's .d.ts declares its own ambient `Buffer` (extends ArrayBuffer),
  // which conflicts with @types/node's Buffer and makes any typed cast fail
  // structurally — this is a real Buffer at runtime, so `any` is the pragmatic
  // escape hatch for this known upstream typing bug.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);
  const sheet = workbook.worksheets[0];

  const allRows: string[][] = [];
  sheet?.eachRow((row) => {
    // exceljs row.values is 1-indexed with a leading empty slot at index 0.
    const values = (row.values as unknown[]).slice(1);
    allRows.push(values.map((v) => (v == null ? "" : String(v))));
  });

  const [headerRow, ...rows] = allRows;
  return { headers: headerRow ?? [], rows };
}
