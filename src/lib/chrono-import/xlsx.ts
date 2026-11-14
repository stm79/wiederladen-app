import { unzipSync, strFromU8 } from "fflate";

/**
 * Minimal .xlsx reader: returns the cell texts of the workbook's first sheet.
 *
 * Chrono exports only need plain values (shot numbers, velocities, labels),
 * so this deliberately skips everything exceljs offered beyond that — styles,
 * formulas (the cached result in <v> is used), and date conversion (dates
 * come back as Excel serial numbers, which no import column depends on).
 *
 * An .xlsx file is a ZIP of XML parts; OOXML written by Excel/LibreOffice/
 * Numbers is regular enough that targeted regexes are reliable here.
 */
export function readFirstSheet(data: Uint8Array): string[][] {
  const wanted = new Set(["xl/workbook.xml", "xl/_rels/workbook.xml.rels", "xl/sharedStrings.xml"]);
  // Only inflate the parts we read (the sheet itself is chosen below), so a
  // large or hostile archive doesn't get fully decompressed.
  const index = unzipSync(data, { filter: (f) => wanted.has(f.name) });

  const sheetPath = resolveFirstSheetPath(index);
  const sheetFile = unzipSync(data, { filter: (f) => f.name === sheetPath })[sheetPath];
  if (!sheetFile) throw new Error("Keine Tabelle in der Excel-Datei gefunden");

  const sharedStrings = parseSharedStrings(index["xl/sharedStrings.xml"]);
  return parseSheet(xmlText(sheetFile), sharedStrings);
}

/** Decode an XML part and drop element namespace prefixes ("<x:row>" ->
 *  "<row>"), which some generators (e.g. Open XML SDK) emit. Attribute
 *  prefixes such as r:id are left alone. */
function xmlText(file: Uint8Array): string {
  return strFromU8(file).replace(/<(\/?)[A-Za-z_][\w.-]*:/g, "<$1");
}

function resolveFirstSheetPath(files: Record<string, Uint8Array>): string {
  const fallback = "xl/worksheets/sheet1.xml";
  const workbook = files["xl/workbook.xml"];
  const rels = files["xl/_rels/workbook.xml.rels"];
  if (!workbook || !rels) return fallback;

  const firstSheet = /<sheet\b[^>]*>/.exec(xmlText(workbook))?.[0];
  const relId = firstSheet && /\br:id="([^"]+)"/.exec(firstSheet)?.[1];
  if (!relId) return fallback;

  for (const rel of xmlText(rels).match(/<Relationship\b[^>]*>/g) ?? []) {
    if (attr(rel, "Id") !== relId) continue;
    const target = attr(rel, "Target");
    if (!target) break;
    // Targets are relative to xl/ unless absolute ("/xl/worksheets/…").
    return target.startsWith("/") ? target.slice(1) : `xl/${target}`;
  }
  return fallback;
}

function parseSharedStrings(file: Uint8Array | undefined): string[] {
  if (!file) return [];
  const xml = xmlText(file);
  return Array.from(xml.matchAll(/<si>([\s\S]*?)<\/si>/g), (m) => textRuns(m[1]));
}

/** Concatenated <t> runs (rich text splits one string into several),
 *  ignoring phonetic hints (<rPh>), which hold their own <t>. */
function textRuns(xml: string): string {
  const withoutPhonetic = xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, "");
  return Array.from(withoutPhonetic.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g), (m) => decodeXml(m[1])).join("");
}

function parseSheet(xml: string, sharedStrings: string[]): string[][] {
  const rows: string[][] = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const row: string[] = [];
    let nextCol = 0;
    // A cell is either self-closing (no value) or has a body.
    for (const cellMatch of (rowMatch[1] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2] ?? "";
      const ref = attr(attrs, "r");
      const col = ref ? columnIndex(ref) : nextCol;
      nextCol = col + 1;
      row[col] = cellText(attr(attrs, "t"), body, sharedStrings);
    }
    // Fill gaps left by skipped (empty) cells.
    const filled = Array.from(row, (v) => v ?? "");
    if (filled.some((v) => v.trim() !== "")) rows.push(filled);
  }
  return rows;
}

function cellText(type: string | null, body: string, sharedStrings: string[]): string {
  if (type === "inlineStr") return textRuns(/<is>([\s\S]*?)<\/is>/.exec(body)?.[1] ?? "");
  const raw = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
  if (raw == null) return "";
  const value = decodeXml(raw);
  if (type === "s") return sharedStrings[Number(value)] ?? "";
  if (type === "b") return value === "1" ? "TRUE" : "FALSE";
  return value; // "n" (default), "str" (formula string), "e" (error)
}

/** "AB12" -> 27 (zero-based column). */
function columnIndex(ref: string): number {
  const letters = /^[A-Z]+/i.exec(ref)?.[0].toUpperCase() ?? "A";
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function attr(tag: string, name: string): string | null {
  return new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(tag)?.[1] ?? null;
}

function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
    switch (e.toLowerCase()) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      case "apos":
        return "'";
    }
    const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return String.fromCodePoint(code);
  });
}
