import { NextResponse } from "next/server";
import { objectsToCsv } from "./csv-export";

export function csvResponse(rows: Record<string, unknown>[], filename: string): NextResponse {
  const csv = objectsToCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
