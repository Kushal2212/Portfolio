import { notFound } from "next/navigation";
import { getAdminPost } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata = { title: "Edit post" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, media] = await Promise.all([
    getAdminPost(id),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 60 }).catch(() => []),
  ]);

  if (!post) notFound();

  return (
    <PostEditor
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content,
        coverImage: post.coverImage ?? "",
        status: post.status,
        featured: post.featured,
        seoTitle: post.seoTitle ?? "",
        seoDesc: post.seoDesc ?? "",
        publishedAt: post.publishedAt?.toISOString() ?? null,
        tags: post.tags.map((tag) => ({ id: tag.id, name: tag.name })),
      }}
      media={media.map((item) => ({
        id: item.id,
        url: item.url,
        filename: item.filename,
        altText: item.altText,
      }))}
    />
  );
}
