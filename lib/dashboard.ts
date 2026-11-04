import { prisma } from "@/lib/prisma";
import { summarizeVisits } from "@/lib/analytics";

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d;
}

export async function getDashboardData() {
  const now = new Date();
  const today = startOfDaysAgo(1);
  const week = startOfDaysAgo(7);
  const month = startOfDaysAgo(30);

  try {
    const [
      totalVisitorsToday,
      totalVisitorsWeek,
      totalVisitorsMonth,
      totalPosts,
      publishedPosts,
      unreadMessages,
      totalImages,
      totalMessages,
      recentMessages,
      recentPosts,
      visits,
    ] = await Promise.all([
      prisma.visit.count({ where: { createdAt: { gte: today } } }),
      prisma.visit.count({ where: { createdAt: { gte: week } } }),
      prisma.visit.count({ where: { createdAt: { gte: month } } }),
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.message.count({ where: { status: "UNREAD" } }),
      prisma.media.count(),
      prisma.message.count(),
      prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
      prisma.post.findMany({ orderBy: { updatedAt: "desc" }, take: 4 }),
      prisma.visit.findMany({ where: { createdAt: { gte: month } }, orderBy: { createdAt: "asc" } }),
    ]);

    const uniqueMonth = new Set(visits.map((v) => v.visitorId)).size;
    const uniqueToday = new Set(visits.filter((v) => v.createdAt >= today).map((v) => v.visitorId)).size;

    const daily = Array.from({ length: 30 }, (_, i) => {
      const day = startOfDaysAgo(30);
      day.setDate(day.getDate() + i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const dayVisits = visits.filter((v) => v.createdAt >= day && v.createdAt < next);
      return {
        date: day.toISOString().slice(5, 10),
        views: dayVisits.length,
        visitors: new Set(dayVisits.map((v) => v.visitorId)).size,
      };
    });

    const summary = summarizeVisits(visits);
    const last30Min = new Date(Date.now() - 30 * 60 * 1000);
    const active = new Set(
      visits.filter((v) => v.createdAt >= last30Min).map((v) => v.visitorId),
    ).size;

    return {
      active,
      visitors: {
        today: totalVisitorsToday,
        week: totalVisitorsWeek,
        month: totalVisitorsMonth,
        uniqueMonth,
        uniqueToday,
      },
      posts: { total: totalPosts, published: publishedPosts },
      messages: { unread: unreadMessages, total: totalMessages },
      media: { total: totalImages },
      recentMessages,
      recentPosts,
      daily,
      topPages: summary.pages.slice(0, 6),
      topReferrers: summary.referrers.slice(0, 5),
      countries: summary.countries.slice(0, 6),
      devices: summary.devices,
      browsers: summary.browsers,
      lastVisit: visits.at(-1)?.createdAt ?? null,
      generatedAt: now,
    };
  } catch {
    return {
      active: 0,
      visitors: { today: 0, week: 0, month: 0, uniqueMonth: 0, uniqueToday: 0 },
      posts: { total: 0, published: 0 },
      messages: { unread: 0, total: 0 },
      media: { total: 0 },
      recentMessages: [],
      recentPosts: [],
      daily: Array.from({ length: 30 }, (_, i) => ({ date: `day ${i + 1}`, views: 0, visitors: 0 })),
      topPages: [],
      topReferrers: [],
      countries: [],
      devices: [],
      browsers: [],
      lastVisit: null,
      generatedAt: now,
    };
  }
}

export async function getVisitorAnalytics(days = 30) {
  const from = startOfDaysAgo(days);
  try {
    const visits = await prisma.visit.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: "asc" },
    });
    const summary = summarizeVisits(visits);

    const daily = Array.from({ length: days }, (_, i) => {
      const day = startOfDaysAgo(days);
      day.setDate(day.getDate() + i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const dayVisits = visits.filter((v) => v.createdAt >= day && v.createdAt < next);
      return {
        date:
          days <= 7
            ? day.toLocaleDateString("en-US", { weekday: "short" })
            : day.toISOString().slice(5, 10),
        views: dayVisits.length,
        visitors: new Set(dayVisits.map((v) => v.visitorId)).size,
      };
    });

    const last30Min = new Date(Date.now() - 30 * 60 * 1000);
    const active = new Set(
      visits.filter((v) => v.createdAt >= last30Min).map((v) => v.visitorId),
    ).size;

    const recent = await prisma.visit.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { path: true, country: true, device: true, createdAt: true },
    });

    return { ...summary, daily, active, recent, days };
  } catch {
    return {
      total: 0,
      unique: 0,
      pages: [],
      referrers: [],
      countries: [],
      devices: [],
      browsers: [],
      systems: [],
      daily: [],
      active: 0,
      recent: [],
      days,
    };
  }
}

export async function getVisitsForExport(days = 30) {
  const from = startOfDaysAgo(days);
  try {
    return await prisma.visit.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}
