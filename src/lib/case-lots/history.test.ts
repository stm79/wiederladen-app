import { describe, expect, it } from "vitest";
import { caseLotCycles, formatCaseLotNumber, suggestCaseLoadCount } from "./history";

const load = (id: string, loadNumber: number, variantLetter: string, caseLoadCount: number | null, date: string) => ({
  id,
  loadNumber,
  variantLetter,
  caseLoadCount,
  createdAt: new Date(date),
});

describe("formatCaseLotNumber", () => {
  it("pads to two digits", () => {
    expect(formatCaseLotNumber(1)).toBe("L-01");
    expect(formatCaseLotNumber(123)).toBe("L-123");
  });
});

describe("caseLotCycles", () => {
  it("groups variants into one cycle and orders cycles by date", () => {
    const cycles = caseLotCycles([
      load("c", 30, "", 3, "2026-09-01"),
      load("b2", 17, "B", 2, "2026-05-02"),
      load("b1", 17, "A", null, "2026-05-01"),
      load("a", 5, "", 1, "2026-01-01"),
    ]);
    expect(cycles.map((c) => c.loadNumber)).toEqual([5, 17, 30]);
    expect(cycles[1].loads.map((l) => l.id)).toEqual(["b1", "b2"]);
    expect(cycles[1].loadCount).toBe(2);
  });

  it("prefers load count over date when both cycles have one", () => {
    const cycles = caseLotCycles([load("new", 4, "", 4, "2026-09-01T00:00:00Z"), load("old", 3, "", 3, "2026-09-01T10:00:00Z")]);
    expect(cycles.map((c) => c.loadNumber)).toEqual([3, 4]);
  });
});

describe("suggestCaseLoadCount", () => {
  it("starts at 1 for an unused lot", () => {
    expect(suggestCaseLoadCount([], 30)).toBe(1);
  });

  it("continues after the highest previous count", () => {
    expect(suggestCaseLoadCount([load("a", 5, "", 1, "2026-01-01"), load("b", 17, "", 4, "2026-05-01")], 30)).toBe(5);
  });

  it("counts cycles when no counts were entered", () => {
    expect(suggestCaseLoadCount([load("a", 5, "", null, "2026-01-01"), load("b", 17, "A", null, "2026-05-01"), load("c", 17, "B", null, "2026-05-01")], 30)).toBe(3);
  });

  it("reuses the count of sibling variants", () => {
    expect(suggestCaseLoadCount([load("a", 5, "", 1, "2026-01-01"), load("b", 17, "A", 2, "2026-05-01")], 17)).toBe(2);
  });
});
