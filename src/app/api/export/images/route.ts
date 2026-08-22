import { existsSync } from "fs";
import { Readable } from "stream";
import { ZipArchive } from "archiver";
import { NextResponse } from "next/server";
import { uploadsRootDir } from "@/lib/uploads";

export async function GET() {
  const root = uploadsRootDir();
  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.on("error", (err) => {
    throw err;
  });

  if (existsSync(root)) {
    archive.directory(root, false, (entry) => (entry.name.split("/").pop()?.startsWith(".") ? false : entry));
  }
  void archive.finalize();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return new NextResponse(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="wiederladen-bilder-${timestamp}.zip"`,
    },
  });
}
