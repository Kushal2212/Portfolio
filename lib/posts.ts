import { prisma } from "@/lib/prisma";
import { readingTime, slugify } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

// Scheduled posts become public as soon as their publish time passes, without
// needing a cron worker. Drafts stay private until explicitly published.
const publishedWhere: Prisma.PostWhereInput = {
  OR: [
    {
      status: "PUBLISHED",
      OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
    },
    {
      status: "SCHEDULED",
      publishedAt: { lte: new Date() },
    },
  ],
};

export const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  createdAt: true,
  readingTime: true,
  views: true,
  featured: true,
  tags: true,
} satisfies Prisma.PostSelect;

type RawPostCard = Prisma.PostGetPayload<{ select: typeof postCardSelect }>;

export type PostTag = { id: string; name: string; slug: string };
export type PostCard = Omit<RawPostCard, "tags"> & { tags: PostTag[] };

// Tags are stored as a string array for MongoDB compatibility. Expose them as
// small objects so the UI and admin keep their existing shape.
function withTags<T extends { tags: string[] }>(post: T): Omit<T, "tags"> & { tags: PostTag[] } {
  return {
    ...post,
    tags: post.tags.map((name) => ({ id: name, name, slug: slugify(name) })),
  };
}

export async function getPublishedPosts({
  query = "",
  tag = "",
  page = 1,
  pageSize = 6,
}: {
  query?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}) {
  const q = query.trim();
  const where: Prisma.PostWhereInput = {
    ...publishedWhere,
    ...(q
      ? {
          AND: [
            {
              OR: [
                { title: { contains: q } },
                { excerpt: { contains: q } },
                { content: { contains: q } },
              ],
            },
          ],
        }
      : {}),
    ...(tag ? { tags: { has: tag } } : {}),
  };

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: postCardSelect,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (Math.max(1, page) - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);
    return { posts: posts.map(withTags), total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  } catch {
    return { posts: [] as PostCard[], total: 0, page, totalPages: 1 };
  }
}

export async function getFeaturedPost() {
  try {
    const post = await prisma.post.findFirst({
      where: publishedWhere,
      select: postCardSelect,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    });
    return post ? withTags(post) : null;
  } catch {
    return null;
  }
}

export async function getRecentPosts(limit = 3, excludeId?: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { ...publishedWhere, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: postCardSelect,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return posts.map(withTags);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await prisma.post.findFirst({
      where: { slug, ...publishedWhere },
    });
    return post ? withTags(post) : null;
  } catch {
    return null;
  }
}

export async function getRelatedPosts(postId: string, tagNames: string[], limit = 3) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        ...publishedWhere,
        id: { not: postId },
        ...(tagNames.length ? { tags: { hasSome: tagNames } } : {}),
      },
      select: postCardSelect,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
    const mapped = posts.map(withTags);
    if (mapped.length >= limit) return mapped;

    const fallback = await prisma.post.findMany({
      where: { ...publishedWhere, id: { notIn: [postId, ...mapped.map((p) => p.id)] } },
      select: postCardSelect,
      orderBy: { publishedAt: "desc" },
      take: limit - mapped.length,
    });
    return [...mapped, ...fallback.map(withTags)];
  } catch {
    return [];
  }
}

export async function getTagsWithCounts() {
  try {
    const posts = await prisma.post.findMany({
      where: publishedWhere,
      select: { tags: true },
    });
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const name of post.tags) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([name, count]) => ({
        id: name,
        name,
        slug: slugify(name),
        _count: { posts: count },
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export async function getPostSlugs() {
  try {
    return await prisma.post.findMany({
      where: publishedWhere,
      select: { slug: true, updatedAt: true },
    });
  } catch {
    return [];
  }
}

export async function incrementPostViews(slug: string) {
  try {
    await prisma.post.update({ where: { slug }, data: { views: { increment: 1 } } });
  } catch {
    // Post may be a draft or gone — ignore.
  }
}

export async function getAdminPosts() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        ...postCardSelect,
        status: true,
        updatedAt: true,
        seoDesc: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return posts.map(withTags);
  } catch {
    return [];
  }
}

export async function getAdminPost(id: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    return post ? withTags(post) : null;
  } catch {
    return null;
  }
}

export function estimateReadingTime(content: string) {
  return readingTime(content);
}
