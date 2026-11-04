import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  FileText,
  Images,
  Mail,
  MousePointerClick,
  PenLine,
  Plus,
  Upload,
  Users,
} from "lucide-react";
import { getDashboardData } from "@/lib/dashboard";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { StatCard, PageHeader } from "@/components/admin/stat-card";
import { ChartLegend, TopPagesBarChart, VisitorsAreaChart } from "@/components/admin/charts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function statusVariant(status: string) {
  switch (status) {
    case "UNREAD":
      return "brand" as const;
    case "REPLIED":
      return "success" as const;
    case "ARCHIVED":
      return "outline" as const;
    default:
      return "default" as const;
  }
}

function postStatusVariant(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "success" as const;
    case "SCHEDULED":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export default async function AdminDashboardPage() {
  const [data, session, settings] = await Promise.all([
    getDashboardData(),
    requireAdmin(),
    getSettings(),
  ]);

  const firstName = session.name.split(" ")[0] || settings.fullName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`${greeting}, ${firstName}.`}
        description={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      >
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link href="/" target="_blank">
            View site <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/admin/blog/new">
            <Plus className="size-3.5" /> New post
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visitors today"
          value={data.visitors.today.toLocaleString()}
          hint={`${data.visitors.week.toLocaleString()} this week`}
          icon={Users}
          href="/admin/visitors"
        />
        <StatCard
          label="Unique · 30 days"
          value={data.visitors.uniqueMonth.toLocaleString()}
          hint={`${data.visitors.month.toLocaleString()} page views`}
          icon={Eye}
          href="/admin/visitors"
        />
        <StatCard
          label="Published posts"
          value={data.posts.published}
          hint={`${data.posts.total - data.posts.published} drafts & scheduled`}
          icon={FileText}
          href="/admin/blog"
        />
        <StatCard
          label="Unread messages"
          value={data.messages.unread}
          hint={`${data.messages.total} total enquiries`}
          icon={Mail}
          href="/admin/messages"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Traffic</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Page views and unique visitors, last 30 days</p>
            </div>
            <ChartLegend
              items={[
                { label: "Page views", color: "#8a9a74" },
                { label: "Visitors", color: "#7b96a8" },
              ]}
            />
          </div>
          <div className="mt-4">
            <VisitorsAreaChart data={data.daily} height={250} />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              {data.active} active in the last 30 minutes
            </span>
            <Link href="/admin/visitors" className="inline-flex items-center gap-1 hover:text-foreground">
              Full analytics <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Quick actions</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">The things you reach for most.</p>
          <div className="mt-4 grid gap-2">
            <Link
              href="/admin/blog/new"
              className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-brand/40 hover:bg-muted/40"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-strong/15 text-brand">
                <PenLine className="size-3.5" />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-medium">Write a new post</span>
                <span className="block text-[10px] text-muted-foreground">Draft, preview and publish</span>
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/admin/media"
              className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-brand/40 hover:bg-muted/40"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                <Upload className="size-3.5" />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-medium">Upload an image</span>
                <span className="block text-[10px] text-muted-foreground">{data.media.total} assets in the library</span>
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/admin/messages"
              className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-brand/40 hover:bg-muted/40"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                <Mail className="size-3.5" />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-medium">Open the inbox</span>
                <span className="block text-[10px] text-muted-foreground">{data.messages.unread} unread</span>
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Images className="size-3" /> {data.media.total} images
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MousePointerClick className="size-3" /> {data.visitors.month} views / 30d
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold">Recent messages</p>
            <Link href="/admin/messages" className="text-[10px] text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {data.recentMessages.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">No messages yet. The contact form is live and waiting.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.recentMessages.map((message) => (
                <Link
                  key={message.id}
                  href="/admin/messages"
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold uppercase">
                    {message.name.slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium">{message.name}</span>
                      <Badge variant={statusVariant(message.status)} className="shrink-0 text-[9px]">
                        {message.status.toLowerCase()}
                      </Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {message.subject || message.body}
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px] text-muted-foreground">{timeAgo(message.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold">Recent posts</p>
            <Link href="/admin/blog" className="text-[10px] text-muted-foreground hover:text-foreground">
              Manage posts
            </Link>
          </div>
          {data.recentPosts.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">Nothing written yet. Your first post is one click away.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}/edit`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{post.title}</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      Updated {timeAgo(post.updatedAt)} · {post.views.toLocaleString()} views
                    </span>
                  </span>
                  <Badge variant={postStatusVariant(post.status)} className="text-[9px]">
                    {post.status.toLowerCase()}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Top pages</p>
            <span className="text-[10px] text-muted-foreground">Last 30 days</span>
          </div>
          {data.topPages.length > 0 ? (
            <div className="mt-4">
              <TopPagesBarChart data={data.topPages} height={200} />
            </div>
          ) : (
            <p className="py-12 text-center text-xs text-muted-foreground">
              No traffic recorded yet. Visit the public site in a private window to see data here.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Traffic sources</p>
          <div className="mt-4 space-y-2.5">
            {data.topReferrers.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No referrers recorded yet.</p>
            )}
            {data.topReferrers.map((source) => {
              const total = data.topReferrers.reduce((sum, item) => sum + item.value, 0) || 1;
              return (
                <div key={source.name}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="truncate text-foreground/80">{source.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {Math.round((source.value / total) * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand-strong"
                      style={{ width: `${Math.max(4, (source.value / total) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/admin/visitors"
            className="mt-5 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            See all sources <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
