/** Reference catalog of current component-bullet lines from Hornady, Sierra,
 *  Nosler, Berger, and Lapua, offered as dropdown suggestions on the load
 *  form (in addition to whatever's already been typed into existing loads —
 *  see getDistinctLoadFieldValues). Lists product lines/families rather
 *  than individual caliber+weight SKUs (there are far too many of those to
 *  enumerate usefully). The field stays free text, so anything missing here
 *  (a specific weight/caliber, a newer/discontinued line, another brand)
 *  can still be typed in directly. */
export const BULLET_CATALOG: string[] = [
  // Hornady
  "Hornady A-MAX",
  "Hornady A-Tip Match",
  "Hornady AEROMATCH",
  "Hornady CX",
  "Hornady DGS",
  "Hornady DGH",
  "Hornady DGX",
  "Hornady DGX Bonded",
  "Hornady ECX",
  "Hornady ELD Match",
  "Hornady ELD-VT",
  "Hornady ELD-X",
  "Hornady FMJ",
  "Hornady FTX",
  "Hornady HAP",
  "Hornady InterLock",
  "Hornady Match",
  "Hornady MonoFlex",
  "Hornady NTX",
  "Hornady SST",
  "Hornady Sub-X",
  "Hornady V-MAX",
  "Hornady XTP",
  "Hornady XTP Mag",

  // Sierra
  "Sierra MatchKing",
  "Sierra Tipped MatchKing",
  "Sierra MatchKing X",
  "Sierra GameChanger",
  "Sierra GameKing",
  "Sierra Tipped GameKing",
  "Sierra Tipped VarmintKing",
  "Sierra Pro-Hunter",
  "Sierra Sports Master",

  // Nosler
  "Nosler AccuBond",
  "Nosler AccuBond Long Range",
  "Nosler Ballistic Silvertip",
  "Nosler Ballistic Tip Hunting",
  "Nosler Ballistic Tip Lead Free",
  "Nosler Ballistic Tip Muzzleloader",
  "Nosler Ballistic Tip Varmint",
  "Nosler Custom Competition",
  "Nosler E-Tip",
  "Nosler Partition",
  "Nosler RDF",
  "Nosler Solid",
  "Nosler Solid Base",
  "Nosler Sporting Handgun",
  "Nosler Varmageddon",

  // Berger
  "Berger Classic Hunter",
  "Berger Elite Hunter",
  "Berger VLD Hunting",
  "Berger Hybrid Target",
  "Berger Long Range Hybrid Target",
  "Berger VLD Target",
  "Berger OTM Tactical",
  "Berger Varmint",

  // Lapua
  "Lapua Scenar",
  "Lapua Scenar-L",
  "Lapua Naturalis",
  "Lapua Mega",
  "Lapua LockBase",
  "Lapua FMJ",
  "Lapua Soft Point",
  "Lapua Cutting Edge",
];
