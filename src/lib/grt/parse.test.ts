import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { grtLoadData, parseGrtFile } from "./parse";
import { caliberKey, grtToLoadPrefill, matchFirearm } from "./to-load";

function fixture(name: string): string {
  return readFileSync(path.resolve(process.cwd(), "test/fixtures/grt", name), "utf-8");
}

describe("parseGrtFile / grtLoadData", () => {
  it("reads a .308 project with a projectile that has no maker/product split", () => {
    const data = grtLoadData(parseGrtFile(fixture("308_Lapua_Scenar_155.grtload")));
    expect(data).toEqual({
      caliberName: ".308 Win. (308 Winchester, 7,62 x 51)",
      gunName: null,
      powder: "ReloadSwiss RS 52",
      powderLot: "2019-01",
      chargeGrains: 45.1,
      bullet: "Lapua Scenar GB491 7073 G7",
      bulletWeightGr: 155,
      oalMm: 71.63,
      barrelLengthMm: 510,
      twistMm: null,
      caseLengthMm: 51.15,
      caseVolumeCm3: 3.55,
    });
  });

  it("uses the propellant section, not the (stale) title", () => {
    const data = grtLoadData(parseGrtFile(fixture("223_Hornady_35NTX_N135.grtload")));
    expect(data.powder).toBe("Lovex D073-04");
    expect(data.bullet).toBe("Hornady NTX 22240");
    expect(data.bulletWeightGr).toBe(35);
    expect(data.chargeGrains).toBe(25.9);
    expect(data.twistMm).toBe(305);
  });

  it("ignores inputs inside the appendix and handles single quotes and units", () => {
    const xml = `<?xml version="1.0"?><GordonsReloadingTool version='1'><InnerBallistikInput>
      <caliber><input name='oal' value='2.8' unit='in' /></caliber>
      <gun><input name="GunName" value="Tikka%20T3x" unit="" /></gun>
      <projectile><input name="mname" value="Sierra" unit="" /><input name="pname" value="MatchKing" unit="" /><input name="mp" value="168" unit="gr" /></projectile>
      <propellant><input name="mname" value="Vihtavuori" unit="" /><input name="pname" value="Vihtavuori%20N150" unit="" /><input name="mc" value="0" unit="g" /></propellant>
      <appendix><projectile><input name="mp" value="1" unit="g" /></projectile></appendix>
    </InnerBallistikInput></GordonsReloadingTool>`;
    const data = grtLoadData(parseGrtFile(xml));
    expect(data.oalMm).toBe(71.12);
    expect(data.gunName).toBe("Tikka T3x");
    expect(data.bullet).toBe("Sierra MatchKing");
    expect(data.bulletWeightGr).toBe(168);
    expect(data.powder).toBe("Vihtavuori N150");
    expect(data.chargeGrains).toBeNull();
  });

  it("rejects other XML", () => {
    expect(() => parseGrtFile(`<?xml version="1.0"?><foo/>`)).toThrow();
  });
});

describe("firearm matching", () => {
  const firearms = [
    { id: "a", name: "Sauer 100", caliber: "6.5 Creedmoor" },
    { id: "b", name: "Tikka T3x CTR", caliber: ".308 Winchester" },
    { id: "c", name: "Mauser M98", caliber: "8x57 IS" },
  ];
  const base = grtLoadData(parseGrtFile(fixture("308_Lapua_Scenar_155.grtload")));

  it("normalizes caliber names", () => {
    expect(caliberKey(".308 Win. (308 Winchester, 7,62 x 51)")).toBe("308");
    expect(caliberKey("8 x 57 IS (8 x 57 JS)")).toBe("8x57");
    expect(caliberKey("6,5 Creedmoor")).toBe("6.5");
    expect(caliberKey(".223 Rem.")).toBe("223");
  });

  it("matches by unique caliber, by gun name, or not at all", () => {
    expect(matchFirearm(base, firearms)).toEqual({ firearm: firearms[1], by: "caliber" });
    expect(matchFirearm({ ...base, caliberName: "8 x 57 IS (8 x 57 JS)" }, firearms)?.firearm.id).toBe("c");
    expect(matchFirearm({ ...base, gunName: "Sauer 100" }, firearms)).toEqual({ firearm: firearms[0], by: "name" });
    expect(matchFirearm({ ...base, gunName: "SM12" }, firearms)?.by).toBe("caliber");
    expect(matchFirearm(base, [...firearms, { id: "d", name: "SM12", caliber: ".308 Win" }])).toBeNull();
    expect(matchFirearm({ ...base, caliberName: ".223 Rem." }, firearms)).toBeNull();
  });

  it("leaves the firearm empty when nothing matches", () => {
    const { prefill } = grtToLoadPrefill({ ...base, caliberName: ".223 Rem." }, {
      fileName: "x.grtload",
      firearms,
      knownPowders: [],
      knownBullets: [],
    });
    expect(prefill.firearmId).toBe("");
  });

  it("builds form values with known spellings and notes", () => {
    const { prefill, firearm } = grtToLoadPrefill(base, {
      fileName: "308_Lapua_Scenar_155.grtload",
      firearms,
      knownPowders: ["Reload Swiss RS52"],
      knownBullets: ["Lapua Scenar"],
    });
    expect(firearm?.firearm.id).toBe("b");
    expect(prefill).toMatchObject({ firearmId: "b", powder: "Reload Swiss RS52", chargeGrains: 45.1, bullet: "Lapua Scenar GB491 7073 G7" });
    expect(prefill.notes).toContain("Pulver-Los: 2019-01");
    expect(prefill.notes).toContain("Lauflänge: 510 mm");
  });
});
