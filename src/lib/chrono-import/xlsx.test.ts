import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { readFirstSheet } from "./xlsx";
import { parseExcelTable } from "./parse-table";

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`;

function workbookXml(sheets: { name: string; rid: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheets.map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="${s.rid}"/>`).join("")}</sheets></workbook>`;
}

function relsXml(rels: { id: string; target: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels
    .map((r) => `<Relationship Id="${r.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="${r.target}"/>`)
    .join("")}</Relationships>`;
}

function sheetXml(rows: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows}</sheetData></worksheet>`;
}

function xlsx(parts: Record<string, string>): Uint8Array {
  return zipSync(
    Object.fromEntries(Object.entries({ "[Content_Types].xml": CONTENT_TYPES, ...parts }).map(([k, v]) => [k, strToU8(v)]))
  );
}

describe("readFirstSheet", () => {
  it("reads shared strings, numbers, inline strings and booleans", () => {
    const file = xlsx({
      "xl/workbook.xml": workbookXml([{ name: "Data", rid: "rId1" }]),
      "xl/_rels/workbook.xml.rels": relsXml([{ id: "rId1", target: "worksheets/sheet1.xml" }]),
      "xl/sharedStrings.xml": `<sst><si><t>Schuss</t></si><si><r><t>Tempo </t></r><r><t xml:space="preserve">(MPS)</t></r></si><si><t>A &amp; B</t><rPh><t>ignored</t></rPh></si></sst>`,
      "xl/worksheets/sheet1.xml": sheetXml(
        `<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>` +
          `<row r="2"><c r="A2"><v>1</v></c><c r="B2"><v>822.6</v></c><c r="C2" t="inlineStr"><is><t>ok</t></is></c></row>` +
          `<row r="3"><c r="A3"><v>2</v></c><c r="B3" t="str"><f>B2-10</f><v>812.6</v></c><c r="C3" t="b"><v>1</v></c></row>`
      ),
    });
    expect(readFirstSheet(file)).toEqual([
      ["Schuss", "Tempo (MPS)", "A & B"],
      ["1", "822.6", "ok"],
      ["2", "812.6", "TRUE"],
    ]);
  });

  it("places cells by reference, fills gaps and skips empty rows", () => {
    const file = xlsx({
      "xl/worksheets/sheet1.xml": sheetXml(
        `<row r="1"><c r="B1"><v>5</v></c><c r="D1" s="1"/><c r="E1"><v>7</v></c></row>` +
          `<row r="2"/>` +
          `<row r="3"><c r="A3" s="2"/></row>` +
          `<row r="4"><c><v>1</v></c><c><v>2</v></c></row>`
      ),
    });
    expect(readFirstSheet(file)).toEqual([
      ["", "5", "", "", "7"],
      ["1", "2"],
    ]);
  });

  it("follows the workbook relationship to the first sheet, not sheet1.xml", () => {
    const file = xlsx({
      "xl/workbook.xml": workbookXml([
        { name: "Serie 2", rid: "rId7" },
        { name: "Serie 1", rid: "rId3" },
      ]),
      "xl/_rels/workbook.xml.rels": relsXml([
        { id: "rId3", target: "worksheets/sheet1.xml" },
        { id: "rId7", target: "/xl/worksheets/sheet2.xml" },
      ]),
      "xl/worksheets/sheet1.xml": sheetXml(`<row r="1"><c r="A1"><v>1</v></c></row>`),
      "xl/worksheets/sheet2.xml": sheetXml(`<row r="1"><c r="A1"><v>2</v></c></row>`),
    });
    expect(readFirstSheet(file)).toEqual([["2"]]);
  });

  it("handles namespace-prefixed elements and numeric entities", () => {
    const file = xlsx({
      "xl/worksheets/sheet1.xml": `<x:worksheet xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><x:sheetData><x:row r="1"><x:c r="A1" t="inlineStr"><x:is><x:t>&#916; &#x00B0;C</x:t></x:is></x:c></x:row></x:sheetData></x:worksheet>`,
    });
    expect(readFirstSheet(file)).toEqual([["Δ °C"]]);
  });

  it("rejects files that are not xlsx archives", () => {
    expect(() => readFirstSheet(strToU8("not a zip"))).toThrow();
  });
});

describe("parseExcelTable", () => {
  it("splits header row from data rows", async () => {
    const data = xlsx({
      "xl/worksheets/sheet1.xml": sheetXml(
        `<row r="1"><c r="A1" t="inlineStr"><is><t>#</t></is></c><c r="B1" t="inlineStr"><is><t>FPS</t></is></c></row>` +
          `<row r="2"><c r="A2"><v>1</v></c><c r="B2"><v>2701</v></c></row>`
      ),
    });
    const table = await parseExcelTable(new File([data as BlobPart], "series.xlsx"));
    expect(table).toEqual({ headers: ["#", "FPS"], rows: [["1", "2701"]] });
  });
});
