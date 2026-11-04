import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { isBot, normalizeReferrer, parseUserAgent } from "@/lib/analytics";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`track:${ip}`, 60, 60_000);
  if (!limit.success) return new NextResponse(null, { status: 429 });

  let body: { path?: string; referrer?: string };
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const path = (body.path || "/").slice(0, 300);
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
    return new NextResponse(null, { status: 204 });
  }

  const ua = request.headers.get("user-agent") || "";
  if (isBot(ua)) return new NextResponse(null, { status: 204 });

  // Don't count the owner browsing their own site.
  const cookies = request.headers.get("cookie") || "";
  if (cookies.includes(`${SESSION_COOKIE}=`)) {
    return new NextResponse(null, { status: 204 });
  }

  const { device, browser, os } = parseUserAgent(ua);
  const host = request.headers.get("host") || undefined;
  const referrer = normalizeReferrer(body.referrer || null, host);
  const country = request.headers.get("x-vercel-ip-country") || null;
  const city = request.headers.get("x-vercel-ip-city") || null;

  const existingId = /kd_vid=([^;]+)/.exec(cookies)?.[1];
  const visitorId = existingId || randomUUID();

  try {
    await prisma.visit.create({
      data: {
        visitorId,
        path,
        referrer,
        country,
        city: city ? decodeURIComponent(city) : null,
        device,
        browser,
        os,
      },
    });
  } catch (error) {
    console.error("track failed", error);
    return new NextResponse(null, { status: 204 });
  }

  const response = new NextResponse(null, { status: 204 });
  if (!existingId) {
    response.cookies.set("kd_vid", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}
