"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { postSchema } from "@/lib/validators";
import { readingTime } from "@/lib/utils";

export type ActionResult = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
};

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// MongoDB stores tags as a scalar string array.
function normalizeTags(tags: string[] = []) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 8);
}

function revalidatePost(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function validateAndPrepare(input: unknown) {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors } as const;
  }

  const data = parsed.data;
  const existing = await prisma.post.findUnique({ where: { slug: data.slug }, select: { id: true } });

  return { data, existing } as const;
}

export async function createPostAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const prepared = await validateAndPrepare(input);
    if ("error" in prepared) return prepared;
    const { data, existing } = prepared;
    if (existing) return { error: "That slug is already in use. Try a different one.", fieldErrors: { slug: "Already taken" } };

    const publishedAt =
      data.status === "PUBLISHED"
        ? parseDate(data.publishedAt) ?? new Date()
        : data.status === "SCHEDULED"
          ? parseDate(data.publishedAt)
          : parseDate(data.publishedAt);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        status: data.status,
        featured: data.featured ?? false,
        readingTime: readingTime(data.content),
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        publishedAt,
        tags: normalizeTags(data.tags),
      },
    });

    revalidatePost(post.slug);
    return { ok: true, id: post.id };
  } catch (error) {
    console.error("createPost failed", error);
    return { error: "Could not create the post. Please try again." };
  }
}

export async function updatePostAction(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const prepared = await validateAndPrepare(input);
    if ("error" in prepared) return prepared;
    const { data, existing } = prepared;
    if (existing && existing.id !== id) {
      return { error: "That slug is already in use.", fieldErrors: { slug: "Already taken" } };
    }

    const current = await prisma.post.findUnique({ where: { id } });
    if (!current) return { error: "Post not found." };

    const publishedAt =
      data.status === "PUBLISHED"
        ? current.publishedAt ?? parseDate(data.publishedAt) ?? new Date()
        : data.status === "SCHEDULED"
          ? parseDate(data.publishedAt)
          : current.publishedAt;

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        status: data.status,
        featured: data.featured ?? false,
        readingTime: readingTime(data.content),
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        publishedAt,
        tags: normalizeTags(data.tags),
      },
    });

    revalidatePost(post.slug);
    if (current.slug !== post.slug) revalidatePath(`/blog/${current.slug}`);
    return { ok: true, id: post.id };
  } catch (error) {
    console.error("updatePost failed", error);
    return { error: "Could not save the post. Please try again." };
  }
}

export async function deletePostsAction(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!ids.length) return { error: "Nothing selected." };
  try {
    const posts = await prisma.post.findMany({ where: { id: { in: ids } }, select: { slug: true } });
    await prisma.post.deleteMany({ where: { id: { in: ids } } });
    revalidatePost();
    posts.forEach((post) => revalidatePath(`/blog/${post.slug}`));
    return { ok: true };
  } catch (error) {
    console.error("deletePosts failed", error);
    return { error: "Could not delete the selected posts." };
  }
}

export async function setPostsStatusAction(
  ids: string[],
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED",
): Promise<ActionResult> {
  await requireAdmin();
  if (!ids.length) return { error: "Nothing selected." };
  try {
    await prisma.post.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      },
    });
    revalidatePost();
    return { ok: true };
  } catch (error) {
    console.error("setPostsStatus failed", error);
    return { error: "Could not update the selected posts." };
  }
}
