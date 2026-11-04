import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata = { title: "New post" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const media = await prisma.media
    .findMany({ orderBy: { createdAt: "desc" }, take: 60 })
    .catch(() => []);

  return (
    <PostEditor
      media={media.map((item) => ({
        id: item.id,
        url: item.url,
        filename: item.filename,
        altText: item.altText,
      }))}
    />
  );
}
