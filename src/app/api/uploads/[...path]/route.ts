import { NextResponse } from "next/server";
import { readGroupImage } from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = segments.join("/");

  try {
    const buffer = await readGroupImage(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Bild nicht gefunden" }, { status: 404 });
  }
}
