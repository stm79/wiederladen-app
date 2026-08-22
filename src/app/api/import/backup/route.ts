import { copyFile, rename, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SQLITE_MAGIC = Buffer.from("SQLite format 3\0");

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Keine Datei übermittelt" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!buffer.subarray(0, SQLITE_MAGIC.length).equals(SQLITE_MAGIC)) {
    return NextResponse.json({ error: "Keine gültige SQLite-Backup-Datei" }, { status: 400 });
  }

  // Mirrors DATABASE_URL, same as the backup-download route.
  const dbPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "data/db/wiederladen.db");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safetyBackupPath = `${dbPath}.pre-restore-${timestamp}.bak`;
  const incomingPath = `${dbPath}.incoming-${timestamp}`;

  try {
    await writeFile(incomingPath, buffer);
    await copyFile(dbPath, safetyBackupPath);
    await prisma.$disconnect();
    await rename(incomingPath, dbPath);
  } catch {
    return NextResponse.json({ error: "Wiederherstellung fehlgeschlagen" }, { status: 500 });
  }

  // The swapped-in file may be on an older schema version, and this process
  // still holds Prisma's now-stale query engine — exiting lets docker's
  // "restart: unless-stopped" bring the container back up through the normal
  // entrypoint (migrate deploy, then a fresh `next start`) against the
  // restored file.
  setTimeout(() => process.exit(1), 250);

  return NextResponse.json({ ok: true });
}
