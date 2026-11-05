import "server-only";

import { prisma } from "@/lib/prisma";

export type PublicProject = {
  slug: string;
  name: string;
  year: string;
  summary: string;
  tags: string[];
  coverImage: string | null;
  href: string | null;
  repo: string | null;
  metric: string;
  metricLabel: string;
  status: string;
};

/**
 * Returns projects for the home page. `null` means there are no rows at all
 * (or the database is unreachable), so the caller can show the built-in
 * examples. An empty array means every project is currently hidden.
 */
export async function getPublicProjects(): Promise<PublicProject[] | null> {
  try {
    const rows = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return null;

    return rows
      .filter((row) => row.published)
      .map((row) => ({
        slug: row.slug,
        name: row.name,
        year: row.year,
        summary: row.summary,
        tags: row.tags,
        coverImage: row.coverImage,
        href: row.href,
        repo: row.repo,
        metric: row.metric ?? "",
        metricLabel: row.metricLabel ?? "",
        status: row.status,
      }));
  } catch {
    return null;
  }
}
