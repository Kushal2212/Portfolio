"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export type GalleryPhoto = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

function isVideo(photo: GalleryPhoto) {
  return photo.mimeType.startsWith("video/");
}

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [featured, ...rest] = photos;

  const close = React.useCallback(() => setActiveIndex(null), []);
  const showPrevious = React.useCallback(() => {
    setActiveIndex((index) =>
      index === null ? null : (index - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);
  const showNext = React.useCallback(() => {
    setActiveIndex((index) => (index === null ? null : (index + 1) % photos.length));
  }, [photos.length]);

  React.useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, showNext, showPrevious]);

  if (!featured) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-24 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ImageIcon className="size-5" />
        </span>
        <p className="mt-4 text-sm font-medium">No photos up yet</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          The gallery is being slowly filled. Check back later, or say hello if you would like to
          see recent work.
        </p>
      </div>
    );
  }

  const active = activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <div className="space-y-4">
        <PhotoButton
          photo={featured}
          index={0}
          onOpen={() => setActiveIndex(0)}
          className="w-full"
          imageClassName="aspect-[16/10] w-full sm:aspect-[16/8]"
          priority
        />

        {rest.length > 0 && (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {rest.map((photo, index) => (
              <PhotoButton
                key={photo.id}
                photo={photo}
                index={index + 1}
                onOpen={() => setActiveIndex(index + 1)}
                className="mb-4 break-inside-avoid"
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-5xl gap-3 p-3 sm:p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>{active?.caption || active?.alt || "Photograph"}</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="relative overflow-hidden rounded-xl bg-muted">
              {isVideo(active) ? (
                <video
                  key={active.id}
                  src={active.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[72vh] w-full bg-black object-contain"
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={active.url}
                    alt={active.alt}
                    className="max-h-[72vh] w-full object-contain"
                  />
                </>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-end justify-between gap-3 px-1 pb-1">
            <div className="min-w-0">
              {active?.caption && (
                <p className="text-sm leading-relaxed text-foreground/90">{active.caption}</p>
              )}
              {active && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {formatDate(active.createdAt)}
                </p>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={showPrevious}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-1 font-mono text-[10px] text-muted-foreground">
                  {(activeIndex ?? 0) + 1} / {photos.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={showNext}
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PhotoButton({
  photo,
  index,
  onOpen,
  className,
  imageClassName,
  priority,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: () => void;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  const ratio =
    photo.width && photo.height ? `${photo.width} / ${photo.height}` : undefined;
  const video = isVideo(photo);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border bg-muted text-left",
        className,
      )}
      aria-label={`Open ${video ? "video" : "photo"} ${index + 1}${photo.caption ? `: ${photo.caption}` : ""}`}
    >
      {video ? (
        <>
          <video
            src={`${photo.url}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            style={!imageClassName && ratio ? { aspectRatio: ratio } : undefined}
            className={cn(
              "w-full bg-black object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]",
              imageClassName,
            )}
          />
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
            <Play className="size-2.5 fill-current" /> Video
          </span>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.alt}
            loading={priority ? "eager" : "lazy"}
            style={!imageClassName && ratio ? { aspectRatio: ratio } : undefined}
            className={cn(
              "w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]",
              imageClassName,
            )}
          />
        </>
      )}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
      {photo.caption && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-sm text-white/90 sm:p-5">
          {photo.caption}
        </span>
      )}
    </button>
  );
}
