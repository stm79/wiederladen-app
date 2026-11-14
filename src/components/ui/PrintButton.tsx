"use client";

import { Button } from "./Button";

export function PrintButton() {
  return (
    <Button type="button" icon="printer" onClick={() => window.print()} className="print:hidden">
      Drucken
    </Button>
  );
}
