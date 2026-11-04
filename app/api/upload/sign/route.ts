import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { videoUploadParams } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Returns short-lived signed parameters so the admin browser can upload a
 * video straight to Cloudinary. The API secret stays on the server.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`upload-sign:${getClientIp(request.headers)}`, 30, 60_000).success) {
    return NextResponse.json({ error: "Too many uploads. Slow down a little." }, { status: 429 });
  }

  let body: { filename?: unknown };
  try {
    body = (await request.json()) as { filename?: unknown };
  } catch {
    body = {};
  }

  const original = typeof body.filename === "string" ? body.filename : "video";
  const base =
    original
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "video";
  const id = `${base}-${randomUUID().slice(0, 8)}`;

  const params = videoUploadParams(id);
  if (!params) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Videos will be stored locally instead." },
      { status: 503 },
    );
  }

  return NextResponse.json({ id, ...params });
}
