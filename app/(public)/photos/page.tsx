import type { Metadata } from "next";
import { Camera, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { PhotoGallery, type GalleryPhoto } from "@/components/gallery/photo-gallery";
import { Reveal } from "@/components/aceternity/reveal";

export const metadata: Metadata = {
  title: "Photos",
  description:
    "A small, slowly growing collection of photographs by Kushal Dahal — streets, hills, ordinary days and the people in them.",
  alternates: { canonical: "/photos" },
};

export const revalidate = 60;

export default async function PhotosPage() {
  const [settings, media] = await Promise.all([
    getSettings(),
    prisma.media
      .findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
      .catch(() => []),
  ]);

  const photos: GalleryPhoto[] = media.map((item) => ({
    id: item.id,
    url: item.url,
    alt:
      item.altText ||
      item.caption ||
      `${item.mimeType.startsWith("video/") ? "Video" : "Photograph"} by ${settings.fullName}`,
    caption: item.caption,
    mimeType: item.mimeType,
    width: item.width,
    height: item.height,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-32 sm:pt-40">
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-brand" /> Photographs
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
            A few things I
            <br />
            <span className="font-serif font-normal">noticed</span>.
          </h1>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
            I carry a small camera on walks. Most of these are ordinary frames from around{" "}
            {settings.hometown}: a street after rain, a hill in the morning, friends who agreed to
            stand still. Nothing especially planned.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Camera className="size-3.5 text-brand" /> {photos.length}{" "}
              {photos.length === 1 ? "frame" : "frames"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {settings.hometown}
            </span>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page">
          <Reveal>
            <PhotoGallery photos={photos} />
          </Reveal>

          <Reveal className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>New frames go up when I remember to take the card out of the camera.</p>
            <p className="font-mono uppercase tracking-[0.16em]">
              Photographs by {settings.fullName}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
