import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { UnitPreferences } from "@/lib/units/types";
import { fmt, fmtDateTime } from "./format";
import { pdfStyles as s } from "./styles";
import { formatLoadNumber } from "@/lib/loads/variant-letter";
import { loadDisplayName } from "@/lib/loads/label";

export interface LoadReportData {
  loadNumber: number;
  variantLetter: string;
  name: string | null;
  firearmName: string;
  caliber: string;
  primer: string | null;
  powder: string | null;
  chargeGrains: number;
  bullet: string | null;
  bulletWeightGr: number | null;
  oalMm: number | null;
  cbtoMm: number | null;
  caseBrand: string | null;
  caseQuantity: number | null;
  caseLoadCount: number | null;
  caseTrimLengthMm: number | null;
  sizingDie: string | null;
  shoulderBumpMm: number | null;
  bushingDiameterMm: number | null;
  mandrelDiameterMm: number | null;
  crimpInfo: string | null;
  notes: string | null;
  avgMps: number | null;
  sdMps: number | null;
  esMps: number | null;
  shotCount: number;
  meanExtremeSpreadMm: number | null;
  groupCount: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export function LoadReportDocument({ load, prefs }: { load: LoadReportData; prefs: UnitPreferences }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>{loadDisplayName(load)}</Text>
        <Text style={s.subtitle}>
          {formatLoadNumber(load.loadNumber, load.variantLetter)} · {load.firearmName} ({load.caliber})
        </Text>

        <Text style={s.sectionTitle}>Rezept</Text>
        <Row label="Zündhütchen" value={load.primer ?? "—"} />
        <Row label="Pulver" value={load.powder ?? "—"} />
        <Row label="Ladungsmenge" value={fmt("weight", load.chargeGrains, prefs)} />
        <Row label="Geschoss" value={load.bullet ?? "—"} />
        <Row label="Geschossgewicht" value={fmt("weight", load.bulletWeightGr, prefs)} />
        <Row label="OAL" value={fmt("length", load.oalMm, prefs)} />
        <Row label="CBTO" value={fmt("length", load.cbtoMm, prefs)} />
        <Row label="Crimp" value={load.crimpInfo ?? "—"} />

        <Text style={s.sectionTitle}>Hülsenvorbereitung</Text>
        <Row label="Hülse" value={load.caseBrand ?? "—"} />
        <Row label="Anzahl (Stück)" value={load.caseQuantity != null ? String(load.caseQuantity) : "—"} />
        <Row label="Load Count" value={load.caseLoadCount != null ? String(load.caseLoadCount) : "—"} />
        <Row label="Trimmlänge" value={fmt("length", load.caseTrimLengthMm, prefs)} />
        <Row label="Matrize" value={load.sizingDie ?? "—"} />
        <Row label="Shoulder Bump" value={fmt("length", load.shoulderBumpMm, prefs)} />
        <Row label="Bushing" value={fmt("length", load.bushingDiameterMm, prefs)} />
        <Row label="Expander Mandrel" value={fmt("length", load.mandrelDiameterMm, prefs)} />

        <Text style={s.sectionTitle}>Auswertung ({load.shotCount} Schuss, {load.groupCount} Gruppen)</Text>
        <Row label="Ø Geschwindigkeit" value={fmt("velocity", load.avgMps, prefs, 1)} />
        <Row label="Standardabweichung" value={fmt("velocity", load.sdMps, prefs, 1)} />
        <Row label="Extreme Spread" value={fmt("velocity", load.esMps, prefs, 1)} />
        <Row label="Ø Gruppengröße" value={fmt("length", load.meanExtremeSpreadMm, prefs, 1)} />

        {load.notes && (
          <>
            <Text style={s.sectionTitle}>Notizen</Text>
            <Text style={s.notes}>{load.notes}</Text>
          </>
        )}

        <Text style={s.footer}>Erstellt am {fmtDateTime(new Date())} · Wiederladen</Text>
      </Page>
    </Document>
  );
}
