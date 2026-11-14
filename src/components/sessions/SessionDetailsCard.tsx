"use client";

import { useState, type ComponentProps } from "react";
import { SessionForm } from "@/components/forms/SessionForm";
import { Button } from "@/components/ui/Button";
import { Card, MetaChip, Stat } from "@/components/ui/Layout";

type SessionFormProps = ComponentProps<typeof SessionForm>;

/** Read-only summary of a session's conditions; "Bearbeiten" swaps in the form. */
export function SessionDetailsCard({
  firearms,
  loads,
  session,
  firearmNames,
}: Required<Pick<SessionFormProps, "firearms" | "loads" | "session">> & { firearmNames: string[] }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <SessionForm firearms={firearms} loads={loads} session={session} onCancel={() => setEditing(false)} />;
  }

  const fmt = (v: number | null, unit: string) => (v == null ? "—" : `${v.toLocaleString("de-DE")} ${unit}`);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">Bedingungen</h2>
        <Button type="button" variant="secondary" size="sm" icon="pencil" onClick={() => setEditing(true)}>
          Bearbeiten
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Temperatur">{fmt(session.tempC, "°C")}</Stat>
        <Stat label="Luftdruck">{fmt(session.pressureHPa, "hPa")}</Stat>
        <Stat label="Feuchte">{fmt(session.humidityPct, "%")}</Stat>
      </div>
      {(firearmNames.length > 0 || session.notes) && (
        <div className="mt-4 flex flex-col gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          {firearmNames.length > 0 && <MetaChip icon="crosshair">{firearmNames.join(", ")}</MetaChip>}
          {session.notes && (
            <p className="whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">{session.notes}</p>
          )}
        </div>
      )}
    </Card>
  );
}
