import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  // Mirrors DATABASE_URL ("file:../data/db/wiederladen.db", resolved by Prisma
  // relative to prisma/schema.prisma) as an absolute path from the project root.
  const dbPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "data/db/wiederladen.db");

  try {
    const buffer = await readFile(dbPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="wiederladen-backup-${timestamp}.db"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Backup fehlgeschlagen" }, { status: 500 });
  }
}
