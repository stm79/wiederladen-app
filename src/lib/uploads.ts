import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const MAX_DIMENSION = 3000;

export function uploadsRootDir(): string {
  // Always outside the build output (mounted volume in Docker) — no build-time
  // tracing needed for it.
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOADS_DIR ?? "./data/uploads");
}

/** Re-encodes to JPEG, strips EXIF (incl. any embedded GPS location), caps
 *  dimensions, and stores under a per-group subfolder. Returns a relative
 *  filePath (as stored in GroupImage.filePath) plus the final pixel size. */
export async function saveGroupImage(
  file: File,
  groupId: string
): Promise<{ filePath: string; width: number; height: number }> {
  const dir = path.join(uploadsRootDir(), groupId);
  await mkdir(dir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const filename = `${randomUUID()}.jpg`;

  const outBuffer = await sharp(Buffer.from(arrayBuffer))
    .rotate() // auto-orient from EXIF before stripping it
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();

  const metadata = await sharp(outBuffer).metadata();
  await writeFile(path.join(dir, filename), outBuffer);

  return {
    filePath: path.posix.join(groupId, filename),
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

/** Resolves a stored relative filePath to bytes, guarding against path
 *  traversal outside the uploads root. */
export async function readGroupImage(filePath: string): Promise<Buffer> {
  const root = uploadsRootDir();
  // Runtime-only path outside the build output (mounted volume in Docker) — no
  // build-time tracing needed for it.
  const resolved = path.resolve(/*turbopackIgnore: true*/ root, filePath);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Ungültiger Bildpfad");
  }
  return readFile(resolved);
}

export async function deleteGroupImage(filePath: string): Promise<void> {
  const root = uploadsRootDir();
  const resolved = path.resolve(/*turbopackIgnore: true*/ root, filePath);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error("Ungültiger Bildpfad");
  }
  await unlink(resolved).catch(() => {});
}
