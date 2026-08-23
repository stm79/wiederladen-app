import { describe, expect, it } from "vitest";
import { labelNumber, labelPowder } from "./label-format";

describe("labelNumber", () => {
  it("uses a comma as the decimal separator", () => {
    expect(labelNumber(47.4, 2)).toBe("47,40");
    expect(labelNumber(76.6, 2)).toBe("76,60");
  });

  it("trims to a whole number when the value has no fractional part", () => {
    expect(labelNumber(160, 2)).toBe("160");
    expect(labelNumber(6, 0)).toBe("6");
  });
});

describe("labelPowder", () => {
  it("drops known brand prefixes, keeping the decisive code first", () => {
    expect(labelPowder("Vihtavuori N140")).toBe("N140");
    expect(labelPowder("Reload Swiss RS52")).toBe("RS52");
    expect(labelPowder("Lovex D032")).toBe("D032");
  });

  it("leaves custom/unrecognized powder names unchanged", () => {
    expect(labelPowder("Vith. N150")).toBe("Vith. N150");
    expect(labelPowder("Alliant Reloder 16")).toBe("Alliant Reloder 16");
  });

  it("returns a dash for no powder set", () => {
    expect(labelPowder(null)).toBe("–");
  });
});
