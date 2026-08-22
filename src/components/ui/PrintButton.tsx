"use client";

import { Button } from "./Button";

export function PrintButton() {
  return (
    <Button type="button" onClick={() => window.print()} className="print:hidden">
      Drucken
    </Button>
  );
}
