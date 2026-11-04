import Link from "next/link";
import {
  ArrowDownToLine,
  Clock,
  Eye,
  Globe2,
  MonitorSmartphone,
  MousePointerClick,
  Users,
} from "lucide-react";
import { getVisitorAnalytics } from "@/lib/dashboard";
import { PageHeader, StatCard } from "@/components/admin/stat-card";
import {
  BreakdownPieChart,
  ChartLegend,
  TopPagesBarChart,
  VisitorsAreaChart,
} from "@/components/admin/charts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Visitors" };
export const dynamic = "force-dynamic";

const ranges = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default async function AdminVisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const data = await getVisitorAnalytics(days);

  const avg = Math.round(data.total / days);
  const blogPosts = data.pages.filter((page) => page.name.startsWith("/blog/")).slice(0, 5);
  const deviceColors = ["#8a9a74", "#9b8fb8", "#7b96a8", "#c9a27a"];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Visitors"
        description="First-party, cookie-based analytics. No raw IP addresses are ever stored."
      >
        <div className="flex rounded-full border border-border bg-card p-0.5">
          {ranges.map((range) => (
            <Link
              key={range.days}
              href={`/admin/visitors?days=${range.days}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
                days === range.days ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {range.label}
            </Link>
          ))}
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <a href={`/api/analytics/export?days=${days}`} download>
            <ArrowDownToLine className="size-3.5" /> Export CSV
          </a>
        </Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Page views"
          value={data.total.toLocaleString()}
          hint={`${avg} / day average`}
          icon={MousePointerClick}
        />
        <StatCard
          label="Unique visitors"
          value={data.unique.toLocaleString()}
          hint={
            data.total > 0
              ? `${Math.round((data.unique / Math.max(1, data.total)) * 100)}% of views`
              : "Awaiting first visit"
          }
          icon={Users}
        />
        <StatCard
          label="Active now"
          value={data.active}
          hint="in the last 30 minutes"
          icon={Clock}
        />
        <StatCard
          label="Countries"
          value={data.countries.length}
          hint={data.countries[0]?.name ? `Top: ${data.countries[0].name}` : "No geography yet"}
          icon={Globe2}
        />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Visitors over time</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Page views and unique visitors across the selected range
            </p>
          </div>
          <ChartLegend
            items={[
              { label: "Page views", color: "#8a9a74" },
              { label: "Visitors", color: "#7b96a8" },
            ]}
          />
        </div>
        <div className="mt-4">
          <VisitorsAreaChart data={data.daily} height={280} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Top pages</p>
            <span className="text-[10px] text-muted-foreground">{data.total} views</span>
          </div>
          {data.pages.length > 0 ? (
            <div className="mt-4">
              <TopPagesBarChart data={data.pages.slice(0, 7)} height={240} />
            </div>
          ) : (
            <p className="py-14 text-center text-xs text-muted-foreground">No page views recorded yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Devices</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">How people are reading</p>
          {data.devices.length > 0 ? (
            <>
              <BreakdownPieChart data={data.devices} height={170} />
              <div className="grid grid-cols-2 gap-2">
                {data.devices.map((device, index) => (
                  <div key={device.name} className="flex items-center gap-2 text-[10px]">
                    <span className="size-2 rounded-full" style={{ background: deviceColors[index % deviceColors.length] }} />
                    <span className="flex-1 truncate text-muted-foreground">{device.name}</span>
                    <span className="font-mono text-foreground/70">{device.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-14 text-center text-xs text-muted-foreground">No device data yet.</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Top referrers</p>
          <div className="mt-4 space-y-3">
            {data.referrers.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">Nothing yet.</p>}
            {data.referrers.slice(0, 6).map((source) => (
              <div key={source.name} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="truncate text-foreground/80">{source.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{source.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Countries</p>
          <div className="mt-4 space-y-3">
            {data.countries.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No geography yet.</p>}
            {data.countries.slice(0, 6).map((country) => (
              <div key={country.name} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="truncate text-foreground/80">{country.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{country.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Browsers</p>
          <div className="mt-4 space-y-2.5">
            {data.browsers.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No browser data yet.</p>}
            {data.browsers.slice(0, 6).map((browser) => {
              const total = data.browsers.reduce((sum, item) => sum + item.value, 0) || 1;
              return (
                <div key={browser.name}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground/80">{browser.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {Math.round((browser.value / total) * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand-strong"
                      style={{ width: `${Math.max(4, (browser.value / total) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Eye className="size-3.5 text-brand" />
            <p className="text-sm font-semibold">Top blog posts</p>
          </div>
          <div className="mt-4 space-y-3">
            {blogPosts.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">No blog visits in this range.</p>
            )}
            {blogPosts.map((post) => (
              <div key={post.name} className="flex items-center justify-between gap-3">
                <span className="truncate font-mono text-[10px] text-foreground/70">{post.name}</span>
                <Badge variant="outline">{post.value} views</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <MonitorSmartphone className="size-3.5 text-brand" />
            <p className="text-sm font-semibold">Recent visits</p>
            <span className="ml-auto text-[10px] text-muted-foreground">Latest 8</span>
          </div>
          {data.recent.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">No visits recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.recent.map((visit, index) => (
                <div key={index} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Globe2 className="size-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[10px] text-foreground/80">{visit.path}</span>
                    <span className="block text-[9px] text-muted-foreground">
                      {visit.country || "Unknown"} · {visit.device || "Desktop"}
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px] text-muted-foreground">{formatDateTime(visit.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
