import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getVisitsForExport } from "@/lib/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Quote a CSV field and neutralise formula injection. Spreadsheet apps treat
 * cells beginning with =, +, -, @ or a control character as formulas, so a
 * leading apostrophe keeps visitor-supplied values inert.
 */
function csvEscape(value: unknown) {
  let str = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      "Cache-Control": "no-store",
    },
  });
}
