import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { UnitPreferences } from "@/lib/units/types";
import { fmt, fmtDate, fmtDateTime } from "./format";
import { pdfStyles as s } from "./styles";

export interface SessionReportGroup {
  loadLabel: string;
  distanceM: number | null;
  extremeSpreadMm: number | null;
  meanRadiusMm: number | null;
  shotCount: number | null;
  source: string;
}

export interface SessionReportVelocitySet {
  loadLabel: string;
  sourceDevice: string;
  avgMps: number | null;
  sdMps: number | null;
  esMps: number | null;
  shotCount: number;
}

export interface SessionReportData {
  date: Date;
  location: string | null;
  firearmName: string | null;
  tempC: number | null;
  pressureHPa: number | null;
  humidityPct: number | null;
  notes: string | null;
  loadLabels: string[];
  groups: SessionReportGroup[];
  velocitySets: SessionReportVelocitySet[];
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export function SessionReportDocument({ session, prefs }: { session: SessionReportData; prefs: UnitPreferences }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>Session {fmtDate(session.date)}</Text>
        <Text style={s.subtitle}>
          {[session.location, session.firearmName].filter(Boolean).join(" · ") || "—"}
        </Text>

        <Text style={s.sectionTitle}>Bedingungen</Text>
        <Row label="Temperatur" value={session.tempC != null ? `${session.tempC} °C` : "—"} />
        <Row label="Luftdruck" value={session.pressureHPa != null ? `${session.pressureHPa} hPa` : "—"} />
        <Row label="Luftfeuchtigkeit" value={session.humidityPct != null ? `${session.humidityPct} %` : "—"} />
        <Row label="Verwendete Ladungen" value={session.loadLabels.join(", ") || "—"} />

        {session.groups.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Schussgruppen</Text>
            <View style={s.table}>
              <View style={s.tableHeaderRow}>
                <Text style={s.tableCell}>Ladung</Text>
                <Text style={s.tableCell}>Distanz</Text>
                <Text style={s.tableCell}>Extreme Spread</Text>
                <Text style={s.tableCell}>Mean Radius</Text>
                <Text style={s.tableCell}>Schuss</Text>
              </View>
              {session.groups.map((g, i) => (
                <View key={i} style={s.tableRow}>
                  <Text style={s.tableCell}>{g.loadLabel}</Text>
                  <Text style={s.tableCell}>{g.distanceM != null ? `${g.distanceM} m` : "—"}</Text>
                  <Text style={s.tableCell}>{fmt("length", g.extremeSpreadMm, prefs, 1)}</Text>
                  <Text style={s.tableCell}>{fmt("length", g.meanRadiusMm, prefs, 1)}</Text>
                  <Text style={s.tableCell}>{g.shotCount ?? "—"}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {session.velocitySets.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Geschwindigkeitsmessungen</Text>
            <View style={s.table}>
              <View style={s.tableHeaderRow}>
                <Text style={s.tableCell}>Ladung</Text>
                <Text style={s.tableCell}>Quelle</Text>
                <Text style={s.tableCell}>Ø / SD / ES</Text>
                <Text style={s.tableCell}>Schuss</Text>
              </View>
              {session.velocitySets.map((v, i) => (
                <View key={i} style={s.tableRow}>
                  <Text style={s.tableCell}>{v.loadLabel}</Text>
                  <Text style={s.tableCell}>{v.sourceDevice}</Text>
                  <Text style={s.tableCell}>
                    {fmt("velocity", v.avgMps, prefs, 1)} / {fmt("velocity", v.sdMps, prefs, 1)} /{" "}
                    {fmt("velocity", v.esMps, prefs, 1)}
                  </Text>
                  <Text style={s.tableCell}>{v.shotCount}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {session.notes && (
          <>
            <Text style={s.sectionTitle}>Notizen</Text>
            <Text style={s.notes}>{session.notes}</Text>
          </>
        )}

        <Text style={s.footer}>Erstellt am {fmtDateTime(new Date())} · Wiederladen</Text>
      </Page>
    </Document>
  );
}
