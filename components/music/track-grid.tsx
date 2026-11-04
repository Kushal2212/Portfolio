import { ArrowUpRight, Music2 } from "lucide-react";
import { CoverArt } from "@/components/shared/cover-art";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/lib/music";

export function TrackGrid({
  tracks,
  className,
}: {
  tracks: MusicTrack[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {tracks.map((track) => (
        <article
          key={track.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-brand/30 hover:shadow-[0_28px_60px_-40px_rgba(0,0,0,0.5)]"
        >
          <div className="relative aspect-square overflow-hidden border-b border-border">
            {track.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.coverUrl}
                alt={`Cover art for ${track.title} by ${track.artist}`}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <CoverArt
                seed={`${track.artist}-${track.title}`}
                label={track.artist}
                className="size-full transition-transform duration-700 group-hover:scale-[1.03]"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />
            <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
              {track.album ? "Album" : "Track"}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold tracking-tight">{track.title}</h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{track.artist}</p>
              </div>
              <Music2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" />
            </div>

            {(track.album || track.year) && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {[track.album, track.year].filter(Boolean).join(" · ")}
              </p>
            )}

            {track.note && (
              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {track.note}
              </p>
            )}

            <div className="mt-auto pt-4">
              {track.link ? (
                <Button asChild variant="outline" size="sm" className="w-full rounded-full">
                  <a href={track.link} target="_blank" rel="noreferrer">
                    Listen <ArrowUpRight className="size-3.5" />
                  </a>
                </Button>
              ) : (
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/70">
                  On the shelf
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
