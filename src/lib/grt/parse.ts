import { gramsToGrains, inchesToMm } from "@/lib/units/conversions";

/**
 * Reader for Gordon's Reloading Tool project files (.grtload).
 *
 * A .grtload is XML: <caliber>, <gun>, <projectile> and <propellant> sections
 * of `<input name=… value=… unit=…/>` entries (values URL-encoded), followed
 * by an <appendix> that can embed photos as base64 and run to megabytes. Only
 * the four input sections are read; everything after <appendix> is ignored,
 * so a large file costs no more than a small one beyond reading the text.
 */

export interface GrtValue {
  value: string;
  unit: string;
}

export type GrtSection = Record<string, GrtValue>;

export interface GrtFile {
  title: string | null;
  caliber: GrtSection;
  gun: GrtSection;
  projectile: GrtSection;
  propellant: GrtSection;
}

const SECTIONS = ["caliber", "gun", "projectile", "propellant"] as const;

export function parseGrtFile(text: string): GrtFile {
  if (!/<GordonsReloadingTool\b/.test(text.slice(0, 2000))) {
    throw new Error("Keine GRT-Datei (Gordon's Reloading Tool)");
  }
  // The input sections all precede the (possibly huge) appendix.
  const appendixAt = text.indexOf("<appendix");
  const head = appendixAt >= 0 ? text.slice(0, appendixAt) : text;

  const result: GrtFile = {
    title: decode(/<title>([\s\S]*?)<\/title>/.exec(head)?.[1] ?? "") || null,
    caliber: {},
    gun: {},
    projectile: {},
    propellant: {},
  };
  for (const section of SECTIONS) {
    const body = new RegExp(`<${section}>([\\s\\S]*?)</${section}>`).exec(head)?.[1] ?? "";
    for (const tag of body.match(/<input\b[^>]*>/g) ?? []) {
      const name = attr(tag, "name");
      if (!name) continue;
      result[section][name] = { value: decode(attr(tag, "value") ?? ""), unit: attr(tag, "unit") ?? "" };
    }
  }
  return result;
}

/** The data a .grtload contributes to a new load. Everything is optional —
 *  GRT projects are often half filled in. */
export interface GrtLoadData {
  caliberName: string | null;
  gunName: string | null;
  powder: string | null;
  powderLot: string | null;
  chargeGrains: number | null;
  bullet: string | null;
  bulletWeightGr: number | null;
  oalMm: number | null;
  barrelLengthMm: number | null;
  twistMm: number | null;
  caseLengthMm: number | null;
  caseVolumeCm3: number | null;
}

export function grtLoadData(file: GrtFile): GrtLoadData {
  const { caliber, gun, projectile, propellant } = file;
  return {
    caliberName: text(caliber.CaliberName),
    gunName: text(gun.GunName),
    powder: joinName(text(propellant.mname), text(propellant.pname)),
    powderLot: text(propellant.lotid),
    chargeGrains: round(weightGrains(propellant.mc), 2),
    bullet: bulletName(projectile),
    bulletWeightGr: round(weightGrains(projectile.mp), 1),
    oalMm: round(lengthMm(caliber.oal), 2),
    barrelLengthMm: round(lengthMm(gun.xe), 1),
    twistMm: round(lengthMm(gun.twistlen), 1),
    caseLengthMm: round(lengthMm(caliber.caselen), 2),
    caseVolumeCm3: round(positive(caliber.casevol), 2),
  };
}

/** Manufacturer + product ("Fox Bullets Classic Hunter"); falls back to the
 *  catalog name without its trailing diameter/weight ("Lapua, Scenar GB491,
 *  0.308, 155 grain" → "Lapua Scenar GB491"). */
function bulletName(projectile: GrtSection): string | null {
  const fromParts = joinName(text(projectile.mname), text(projectile.pname));
  if (fromParts) return fromParts;
  const full = text(projectile.ProjectileName);
  if (!full) return null;
  const parts = full.split(",").map((p) => p.trim()).filter(Boolean);
  while (parts.length > 1 && /^(\d*\.\d+|\d+(\.\d+)?\s*(grain|grains|gr|g))$/i.test(parts[parts.length - 1])) parts.pop();
  return parts.join(" ");
}

function joinName(maker: string | null, product: string | null): string | null {
  if (maker && product) return product.toLowerCase().startsWith(maker.toLowerCase()) ? product : `${maker} ${product}`;
  return maker ?? product;
}

function text(v: GrtValue | undefined): string | null {
  const t = v?.value.trim();
  return t ? t : null;
}

function positive(v: GrtValue | undefined): number | null {
  if (!v) return null;
  const n = Number(v.value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function weightGrains(v: GrtValue | undefined): number | null {
  const n = positive(v);
  if (n == null || !v) return null;
  switch (v.unit.toLowerCase()) {
    case "gr":
    case "grain":
    case "grains":
      return n;
    case "kg":
      return gramsToGrains(n * 1000);
    default: // GRT stores weights in grams
      return gramsToGrains(n);
  }
}

function lengthMm(v: GrtValue | undefined): number | null {
  const n = positive(v);
  if (n == null || !v) return null;
  switch (v.unit.toLowerCase()) {
    case "in":
    case "inch":
      return inchesToMm(n);
    case "cm":
      return n * 10;
    case "m":
      return n * 1000;
    default:
      return n;
  }
}

function round(n: number | null, digits: number): number | null {
  if (n == null) return null;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function attr(tag: string, name: string): string | null {
  return new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`).exec(tag)?.slice(1).find((v) => v != null) ?? null;
}

/** URL-decoding (GRT's own escaping) plus the XML entities. */
function decode(s: string): string {
  const xml = s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  try {
    return decodeURIComponent(xml);
  } catch {
    return xml;
  }
}
