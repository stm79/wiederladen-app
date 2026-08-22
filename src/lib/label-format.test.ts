import { describe, expect, it } from "vitest";
import { labelNumber } from "./label-format";

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
