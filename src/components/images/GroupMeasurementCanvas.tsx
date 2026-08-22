"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { extremeSpreadMm, meanRadiusMm, calibrationScaleFactor, type Point } from "@/lib/group-measurement/metrics";
import { saveCalibratedMeasurement } from "@/app/actions/groups";
import { UnitValueInput } from "@/components/units/UnitValueInput";
import { UnitValueDisplay } from "@/components/units/UnitValueDisplay";
import { Button } from "@/components/ui/Button";

interface StoredCalibration {
  p1: Point;
  p2: Point;
  realDistanceMm: number;
}

interface GroupMeasurementCanvasProps {
  sessionId: string;
  groupId: string;
  image: {
    id: string;
    filePath: string;
    width: number;
    height: number;
    calibration: StoredCalibration | null;
    shotPoints: Point[] | null;
  };
}

const MARKER_COLOR = "#ef4444";
const CALIBRATION_COLOR = "#3b82f6";

export function GroupMeasurementCanvas({ sessionId, groupId, image }: GroupMeasurementCanvasProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const [calibPoints, setCalibPoints] = useState<Point[]>(
    image.calibration ? [image.calibration.p1, image.calibration.p2] : []
  );
  const [realDistanceMm, setRealDistanceMm] = useState<number | null>(
    image.calibration?.realDistanceMm ?? null
  );
  const [calibrationConfirmed, setCalibrationConfirmed] = useState(!!image.calibration);
  const [shotPoints, setShotPoints] = useState<Point[]>(image.shotPoints ?? []);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const scaleFactor =
    calibrationConfirmed && calibPoints.length === 2 && realDistanceMm
      ? calibrationScaleFactor(calibPoints[0], calibPoints[1], realDistanceMm)
      : null;

  const liveExtremeSpread = scaleFactor ? extremeSpreadMm(shotPoints, scaleFactor) : null;
  const liveMeanRadius = scaleFactor ? meanRadiusMm(shotPoints, scaleFactor) : null;

  // Load the source image once.
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgLoaded(true);
    img.src = `/api/uploads/${image.filePath}`;
    imgElRef.current = img;
  }, [image.filePath]);

  // Redraw whenever state changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgElRef.current;
    if (!canvas || !img || !imgLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (calibPoints.length >= 1) {
      ctx.strokeStyle = CALIBRATION_COLOR;
      ctx.fillStyle = CALIBRATION_COLOR;
      ctx.lineWidth = Math.max(2, canvas.width / 400);
      if (calibPoints.length === 2) {
        ctx.beginPath();
        ctx.moveTo(calibPoints[0].x, calibPoints[0].y);
        ctx.lineTo(calibPoints[1].x, calibPoints[1].y);
        ctx.stroke();
      }
      for (const p of calibPoints) {
        drawDot(ctx, p, canvas.width, CALIBRATION_COLOR);
      }
    }

    shotPoints.forEach((p, i) => {
      drawDot(ctx, p, canvas.width, MARKER_COLOR, String(i + 1));
    });
  }, [calibPoints, shotPoints, imgLoaded]);

  function getCanvasPoint(e: MouseEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  }

  function handleCanvasClick(e: MouseEvent<HTMLCanvasElement>) {
    const point = getCanvasPoint(e);
    if (!calibrationConfirmed) {
      if (calibPoints.length >= 2) return;
      setCalibPoints((prev) => [...prev, point]);
      return;
    }
    setShotPoints((prev) => [...prev, point]);
    setSaved(false);
  }

  function resetCalibration() {
    setCalibPoints([]);
    setRealDistanceMm(null);
    setCalibrationConfirmed(false);
  }

  async function handleSave() {
    if (!scaleFactor || shotPoints.length < 2 || !realDistanceMm) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const es = extremeSpreadMm(shotPoints, scaleFactor);
      const mr = meanRadiusMm(shotPoints, scaleFactor);
      if (es == null || mr == null) throw new Error("Berechnung fehlgeschlagen");
      await saveCalibratedMeasurement({
        imageId: image.id,
        groupId,
        calibration: { p1: calibPoints[0], p2: calibPoints[1], realDistanceMm },
        shotPoints,
        extremeSpreadMm: es,
        meanRadiusMm: mr,
      });
      setSaved(true);
      router.refresh();
    } catch {
      setSaveError("Speichern fehlgeschlagen.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xl overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <canvas
          ref={canvasRef}
          width={image.width}
          height={image.height}
          onClick={handleCanvasClick}
          className="w-full touch-manipulation"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        />
      </div>

      {!calibrationConfirmed ? (
        <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm font-medium">
            Schritt 1: Kalibrierung — markiere zwei Punkte mit bekanntem Abstand auf dem Bild
            (z.B. Kanten eines Ziel-Quadrats oder ein Lineal).
          </p>
          <p className="text-xs text-neutral-500">
            {calibPoints.length}/2 Punkte gesetzt.
          </p>
          {calibPoints.length === 2 && (
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Realer Abstand
                </label>
                <UnitValueInput kind="length" value={realDistanceMm} onChange={setRealDistanceMm} />
              </div>
              <Button
                type="button"
                disabled={!realDistanceMm || realDistanceMm <= 0}
                onClick={() => setCalibrationConfirmed(true)}
              >
                Kalibrierung übernehmen
              </Button>
            </div>
          )}
          {calibPoints.length > 0 && (
            <Button type="button" variant="ghost" onClick={resetCalibration} className="self-start">
              Kalibrierung zurücksetzen
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm font-medium">
            Schritt 2: Einschüsse markieren — auf jedes Loch tippen/klicken.
          </p>
          <p className="text-xs text-neutral-500">{shotPoints.length} Einschüsse markiert.</p>

          <div className="flex gap-6 text-sm">
            <div>
              <div className="text-neutral-500">Extreme Spread</div>
              <UnitValueDisplay kind="length" value={liveExtremeSpread} />
            </div>
            <div>
              <div className="text-neutral-500">Mean Radius</div>
              <UnitValueDisplay kind="length" value={liveMeanRadius} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={shotPoints.length === 0}
              onClick={() => setShotPoints((prev) => prev.slice(0, -1))}
            >
              Letzten Punkt entfernen
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={shotPoints.length === 0}
              onClick={() => setShotPoints([])}
            >
              Alle Punkte entfernen
            </Button>
            <Button type="button" variant="ghost" onClick={resetCalibration}>
              Kalibrierung ändern
            </Button>
          </div>

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" disabled={shotPoints.length < 2 || isSaving} onClick={handleSave}>
              {isSaving ? "Speichern…" : "Berechnen & Speichern"}
            </Button>
            {saved && (
              <>
                <span className="text-sm text-emerald-600">Gespeichert.</span>
                <Button type="button" variant="secondary" onClick={() => router.push(`/sessions/${sessionId}`)}>
                  Zurück zur Session
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function drawDot(ctx: CanvasRenderingContext2D, p: Point, canvasWidth: number, color: string, label?: string) {
  const radius = Math.max(4, canvasWidth / 150);
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = Math.max(1, canvasWidth / 800);
  ctx.strokeStyle = "white";
  ctx.stroke();

  if (label) {
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(12, canvasWidth / 60)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, p.x, p.y - radius - Math.max(8, canvasWidth / 100));
  }
}
