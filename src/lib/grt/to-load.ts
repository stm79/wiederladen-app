import type { GrtLoadData } from "./parse";

export interface FirearmOption {
  id: string;
  name: string;
  caliber: string;
}

/** Load form fields a GRT file can fill in. */
export interface GrtLoadPrefill {
  /** Empty when no firearm matched, so the form makes the user pick one. */
  firearmId: string;
  powder: string;
  chargeGrains: number;
  bullet: string;
  bulletWeightGr: number | null;
  oalMm: number | null;
  notes: string;
}

/**
 * Maps GRT data onto load form fields. Powder/bullet names are swapped for
 * an already-known spelling when they only differ in spacing/case
 * ("ReloadSwiss RS 52" → "Reload Swiss RS52"), so loads stay groupable.
 * Values without a load field of their own go into the notes.
 */
export function grtToLoadPrefill(
  data: GrtLoadData,
  options: { fileName: string; firearms: FirearmOption[]; knownPowders: string[]; knownBullets: string[] }
): { prefill: GrtLoadPrefill; firearm: FirearmMatch | null } {
  const firearm = matchFirearm(data, options.firearms);

  const notes = [
    `Import aus GRT: ${options.fileName}`,
    data.caliberName && `Kaliber (GRT): ${data.caliberName}`,
    data.gunName && `Waffe (GRT): ${data.gunName}`,
    data.powderLot && `Pulver-Los: ${data.powderLot}`,
    data.barrelLengthMm && `Lauflänge: ${data.barrelLengthMm} mm`,
    data.twistMm && `Drall: ${data.twistMm} mm`,
    data.caseLengthMm && `Hülsenlänge: ${data.caseLengthMm} mm`,
    data.caseVolumeCm3 && `Hülsenvolumen: ${data.caseVolumeCm3} cm³`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    firearm,
    prefill: {
      firearmId: firearm?.firearm.id ?? "",
      powder: data.powder ? knownSpelling(data.powder, options.knownPowders) : "",
      chargeGrains: data.chargeGrains ?? 0,
      bullet: data.bullet ? knownSpelling(bulletAliases(data.bullet), options.knownBullets) : "",
      bulletWeightGr: data.bulletWeightGr,
      oalMm: data.oalMm,
      notes,
    },
  };
}

export interface FirearmMatch {
  firearm: FirearmOption;
  by: "name" | "caliber";
}

/** Gun name first (GRT's "GunName" vs. the firearm's name), then caliber.
 *  Only a unique caliber match counts — with two .308s, the user picks. */
export function matchFirearm(data: GrtLoadData, firearms: FirearmOption[]): FirearmMatch | null {
  if (data.gunName) {
    const gun = compact(data.gunName);
    const byName = firearms.filter((f) => {
      const name = compact(f.name);
      return name !== "" && (name.includes(gun) || gun.includes(name));
    });
    if (byName.length === 1) return { firearm: byName[0], by: "name" };
  }
  const key = caliberKey(data.caliberName);
  if (!key) return null;
  const byCaliber = firearms.filter((f) => caliberKey(f.caliber) === key);
  return byCaliber.length === 1 ? { firearm: byCaliber[0], by: "caliber" } : null;
}

/** ".308 Win. (308 Winchester, 7,62 x 51)" → "308", "8 x 57 IS" → "8x57",
 *  "6.5 Creedmoor" → "6.5", ".223 Rem." → "223". */
export function caliberKey(caliber: string | null): string | null {
  if (!caliber) return null;
  const s = caliber.toLowerCase().replace(/,/g, ".").replace(/\s+/g, "");
  return /(\d+(?:\.\d+)?(?:x\d+(?:\.\d+)?)?)/.exec(s.replace(/^\./, ""))?.[1] ?? null;
}

function compact(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function knownSpelling(value: string, known: string[]): string {
  const key = compact(value);
  return known.find((k) => compact(k) === key) ?? value;
}

/** GRT says "Fox Bullets Classic Hunter"; the catalog says "Fox Classic Hunter". */
function bulletAliases(bullet: string): string {
  return bullet.replace(/^Fox Bullets\b/i, "Fox");
}
