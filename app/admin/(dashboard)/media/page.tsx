import { prisma } from "@/lib/prisma";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { PageHeader } from "@/components/admin/stat-card";
import { MediaManager } from "@/components/admin/media-manager";

export const metadata = { title: "Photos & media" };
export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await prisma.media
    .findMany({ orderBy: { createdAt: "desc" } })
    .catch(() => []);

  const totalBytes = media.reduce((sum, item) => sum + item.size, 0);
  const published = media.filter((item) => item.published).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Photos & media"
        description={`${media.length} images · ${published} in the public gallery · ${(totalBytes / 1024 / 1024).toFixed(1)} MB · ${
          isCloudinaryConfigured() ? "stored on Cloudinary" : "stored locally in /public/uploads"
        }`}
      />
      <MediaManager
        media={media.map((item) => ({
          id: item.id,
          url: item.url,
          filename: item.filename,
          altText: item.altText,
          caption: item.caption,
          published: item.published,
          size: item.size,
          mimeType: item.mimeType,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
