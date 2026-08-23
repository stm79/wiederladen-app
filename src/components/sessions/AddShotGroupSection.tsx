"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ShotGroupForm } from "@/components/forms/ShotGroupForm";

export function AddShotGroupSection({
  sessionId,
  loads,
}: {
  sessionId: string;
  loads: { id: string; name: string | null; caliber: string; bulletWeightGr: number | null; bullet: string | null }[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        + Neue Schussgruppe
      </Button>
    );
  }

  return <ShotGroupForm sessionId={sessionId} loads={loads} onDone={() => setOpen(false)} />;
}
