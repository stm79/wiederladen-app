"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { saveUnitPreferences } from "@/app/actions/settings";
import type { UnitPreferences } from "@/lib/units/types";

interface UnitContextValue {
  prefs: UnitPreferences;
  setPrefs: (prefs: UnitPreferences) => void;
  isSaving: boolean;
}

const UnitContext = createContext<UnitContextValue | null>(null);

export function UnitProvider({
  initialPrefs,
  children,
}: {
  initialPrefs: UnitPreferences;
  children: ReactNode;
}) {
  const [prefs, setLocalPrefs] = useState(initialPrefs);
  const [isSaving, startTransition] = useTransition();

  function setPrefs(next: UnitPreferences) {
    setLocalPrefs(next);
    startTransition(async () => {
      await saveUnitPreferences(next);
    });
  }

  return (
    <UnitContext.Provider value={{ prefs, setPrefs, isSaving }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitContext);
  if (!ctx) {
    throw new Error("useUnits must be used within a UnitProvider");
  }
  return ctx;
}
