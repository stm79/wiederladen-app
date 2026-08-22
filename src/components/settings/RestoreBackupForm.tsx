"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

export function RestoreBackupForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      "Dies überschreibt ALLE aktuellen Daten (Waffen, Ladedaten, Sessions, Schussgruppen) mit dem Inhalt dieser Backup-Datei. Eine Sicherheitskopie der aktuellen Datenbank wird automatisch angelegt. Fortfahren?"
    );
    if (!confirmed) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setStatus("uploading");
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/import/backup", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Wiederherstellung fehlgeschlagen");
      }
      setStatus("done");
      setTimeout(() => window.location.reload(), 4000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Wiederherstellung fehlgeschlagen");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".db"
        disabled={status === "uploading" || status === "done"}
        onChange={(e) => handleFile(e.target.files)}
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        disabled={status === "uploading" || status === "done"}
        onClick={() => inputRef.current?.click()}
        className="w-fit"
      >
        {status === "uploading" ? "Wird wiederhergestellt…" : "Backup wiederherstellen…"}
      </Button>
      {status === "done" && (
        <span className="text-xs text-emerald-600">
          Wiederhergestellt — die App startet neu, Seite lädt gleich automatisch neu…
        </span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
