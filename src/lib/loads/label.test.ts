import { describe, expect, it } from "vitest";
import { loadDisplayName } from "./label";

describe("loadDisplayName", () => {
  it("uses the load's own name when set", () => {
    expect(
      loadDisplayName({ name: "Erste Testladung", caliber: ".308 Win", bulletWeightGr: 168, bullet: "SMK" })
    ).toBe("Erste Testladung");
  });

  it("composes caliber + bullet weight + bullet when no name is set", () => {
    expect(loadDisplayName({ name: null, caliber: ".308 Win", bulletWeightGr: 168, bullet: "SMK" })).toBe(
      ".308 Win 168gr SMK"
    );
  });

  it("falls back gracefully when bullet weight or bullet are missing", () => {
    expect(loadDisplayName({ name: null, caliber: ".308 Win", bulletWeightGr: null, bullet: null })).toBe(
      ".308 Win"
    );
    expect(loadDisplayName({ name: null, caliber: ".308 Win", bulletWeightGr: 168, bullet: null })).toBe(
      ".308 Win 168gr"
    );
  });
});
