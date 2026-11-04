import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe for uptime monitors and hosting platforms.
 * Performs a lightweight ping so a booted process with a broken database
 * connection is reported as unhealthy.
 */
export async function GET() {
  const started = Date.now();

  try {
    await prisma.$runCommandRaw({ ping: 1 });
    return NextResponse.json(
      {
        status: "ok",
        database: "up",
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("health check failed", error);
    return NextResponse.json(
      {
        status: "error",
        database: "down",
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
