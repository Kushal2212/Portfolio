import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getVisitsForExport } from "@/lib/dashboard";

export const runtime = "nodejs";

function csvEscape(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days")) || 30));

  const visits = await getVisitsForExport(days);
  const header = ["timestamp", "path", "referrer", "country", "city", "device", "browser", "os", "visitor_id"];
  const rows = visits.map((visit) =>
    [
      visit.createdAt.toISOString(),
      visit.path,
      visit.referrer,
      visit.country,
      visit.city,
      visit.device,
      visit.browser,
      visit.os,
      visit.visitorId,
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="visits-${days}d-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
