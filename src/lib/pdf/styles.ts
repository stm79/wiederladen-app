import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#171717" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#525252", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 140, color: "#525252" },
  value: { flex: 1 },
  table: { display: "flex", width: "100%" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e5e5", paddingVertical: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    paddingBottom: 4,
    fontWeight: 700,
  },
  tableCell: { flex: 1 },
  notes: { marginTop: 8, fontSize: 10, color: "#404040" },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 8, color: "#a3a3a3" },
});
