import { NextResponse } from "next/server";
import { incrementPostViews } from "@/lib/posts";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`views:${ip}`, 30, 60_000).success) {
    return new NextResponse(null, { status: 429 });
  }

  try {
    const { slug } = (await request.json()) as { slug?: string };
    if (slug && /^[a-z0-9-]{1,120}$/.test(slug)) {
      await incrementPostViews(slug);
    }
  } catch {
    // ignore
  }
  return new NextResponse(null, { status: 204 });
}
