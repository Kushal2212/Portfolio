"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { CoverArt } from "@/components/shared/cover-art";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/lib/music";

/**
 * Used only when a record has no stored length yet, so the silent preview
 * still has a believable run time.
 */
const FALLBACK_SECONDS = 210;

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Vinyl deck, track list and player bar. A track with an audio URL streams for
 * real; without one the record spins as a silent preview and the progress runs
 * over the stored length.
 */
export function Turntable({
  tracks,
  className,
}: {
  tracks: MusicTrack[];
  className?: string;
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const loadedSrc = React.useRef<string | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [audioDuration, setAudioDuration] = React.useState(0);

  const active = tracks[activeIndex] ?? tracks[0];
  const isAudio = Boolean(active?.audioUrl);
  const total = isAudio
    ? audioDuration || active?.duration || 0
    : active?.duration || FALLBACK_SECONDS;
  const percent = total > 0 ? Math.min(100, Math.max(0, (position / total) * 100)) : 0;

  const goTo = React.useCallback(
    (index: number, autoplay = true) => {
      if (!tracks.length) return;
      setActiveIndex(((index % tracks.length) + tracks.length) % tracks.length);
      setPosition(0);
      setAudioDuration(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      setPlaying(autoplay);
    },
    [tracks.length],
  );

  // Keep the hidden audio element in sync with the selected track and the
  // play/pause state.
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!active?.audioUrl) {
      audio.pause();
      return;
    }

    if (loadedSrc.current !== active.audioUrl) {
      loadedSrc.current = active.audioUrl;
      audio.src = active.audioUrl;
    }

    if (playing) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [active, playing]);

  // Silent previews advance with a simple ticker instead of an audio clock.
  React.useEffect(() => {
    if (!playing || isAudio) return;
    const id = window.setInterval(() => {
      setPosition((value) => value + 0.5);
    }, 500);
    return () => window.clearInterval(id);
  }, [playing, isAudio]);

  // Move to the next record when a silent preview reaches the end.
  React.useEffect(() => {
    if (!playing || isAudio || total <= 0 || position < total) return;
    const id = window.setTimeout(() => goTo(activeIndex + 1), 400);
    return () => window.clearTimeout(id);
  }, [activeIndex, goTo, isAudio, playing, position, total]);

  function toggle() {
    if (!active) return;
    if (playing) {
      setPlaying(false);
      return;
    }
    if (total > 0 && position >= total - 0.25) {
      setPosition(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
    setPlaying(true);
  }

  function selectTrack(index: number) {
    if (index === activeIndex) {
      toggle();
      return;
    }
    goTo(index);
  }

  function seek(value: number) {
    setPosition(value);
    if (isAudio && audioRef.current) audioRef.current.currentTime = value;
  }

  if (!active) return null;

  return (
    <div
      className={cn(
        "turntable-root grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-x-14 lg:gap-y-6 xl:gap-x-20",
        playing && "is-playing",
        className,
      )}
    >
      <div className="relative order-2 mx-auto w-full max-w-[34rem] lg:order-1 lg:row-span-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-8 -z-10 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="turntable">
          <div className="turntable-record-clip" aria-hidden="true">
            <div className="turntable-record">
              <span className="turntable-label" />
            </div>
          </div>

          <div className="turntable-sleeve">
            {active.coverUrl ? (
              <Image
                src={active.coverUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 88vw, 460px"
                loading="eager"
                className="object-cover"
              />
            ) : (
              <CoverArt
                seed={`${active.artist}-${active.title}`}
                className="absolute inset-0 size-full"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/25" />

            <div className="relative flex h-full flex-col justify-between p-5 text-white sm:p-7">
              <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/70">
                <span>{playing ? "Now spinning" : "On the sleeve"}</span>
                <span>
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(tracks.length).padStart(2, "0")}
                </span>
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/60">
                  {active.album || (active.year ? String(active.year) : "Side A")}
                </p>
                <p className="mt-2 font-serif text-3xl leading-[1.05] tracking-tight sm:text-4xl">
                  {active.title}
                </p>
                <p className="mt-1.5 text-xs text-white/75">{active.artist}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>
            Side A · {tracks.length} {tracks.length === 1 ? "cut" : "cuts"}
          </span>
          <span>{playing ? "33⅓ rpm" : "Paused"}</span>
        </div>
      </div>

      <div className="order-1 min-w-0 lg:order-2">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px w-8 bg-brand" /> The deck
        </div>
        <h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
          On <span className="font-serif font-normal">rotation</span>.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Pick a record. The sleeve follows, the vinyl slides out, and the needle drops wherever
          the track lives.
        </p>
      </div>

      <div className="order-3 min-w-0">
        <ul className="border-y border-border">
          {tracks.map((track, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={track.id} className="border-b border-border last:border-b-0">
                <div
                  data-active={isActive}
                  className={cn(
                    "turntable-row group flex items-center gap-1 rounded-xl transition-colors",
                    isActive ? "bg-brand/[0.07]" : "hover:bg-muted/50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => selectTrack(index)}
                    aria-pressed={isActive}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-4 text-left sm:gap-4 sm:px-4"
                  >
                    <span
                      className={cn(
                        "w-7 shrink-0 font-mono text-[11px] tabular-nums transition-colors",
                        isActive ? "text-brand" : "text-muted-foreground/70",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm font-medium transition-colors",
                          isActive ? "text-brand" : "group-hover:text-foreground",
                        )}
                      >
                        {track.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {[track.artist, track.album, track.year].filter(Boolean).join(" · ")}
                      </span>
                    </span>

                    <span className="hidden w-9 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground sm:block">
                      {track.duration ? formatTime(track.duration) : ""}
                    </span>

                    <span className="turntable-eq shrink-0" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </button>

                  {track.link ? (
                    <a
                      href={track.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-brand"
                    >
                      <ArrowUpRight className="size-4" />
                      <span className="sr-only">Open {track.title} in a new tab</span>
                    </a>
                  ) : (
                    <span className="mr-2 size-8 shrink-0" aria-hidden="true" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 rounded-2xl border border-border bg-card/70 p-3.5 backdrop-blur-sm sm:p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? `Pause ${active.title}` : `Play ${active.title}`}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_12px_28px_-14px_rgba(0,0,0,0.65)] transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {playing ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 translate-x-px fill-current" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{active.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {active.artist}
                {active.album ? ` · ${active.album}` : ""}
              </p>
            </div>

            {active.link && (
              <a
                href={active.link}
                target="_blank"
                rel="noreferrer"
                aria-label={`Listen to ${active.title} by ${active.artist} on Spotify`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium transition-colors hover:border-brand/40 hover:text-brand"
              >
                <span className="hidden sm:inline">Listen</span>
                <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={Math.max(total, 1)}
              step={1}
              value={Math.min(position, Math.max(total, 1))}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label={`Seek through ${active.title}`}
              aria-valuetext={`${formatTime(position)} of ${formatTime(total)}`}
              className="turntable-range flex-1"
              style={{ "--progress": `${percent}%` } as React.CSSProperties}
            />
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
              {formatTime(position)} / {formatTime(total)}
            </span>
          </div>

          {!active.audioUrl && (
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              Silent preview — no audio file attached.{" "}
              {active.link ? (
                <a
                  href={active.link}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-2 transition-colors hover:text-brand"
                >
                  Listen on Spotify
                </a>
              ) : (
                "Add an audio URL in the admin to hear it here."
              )}
            </p>
          )}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {playing
            ? `Playing ${active.title} by ${active.artist}`
            : `Paused on ${active.title} by ${active.artist}`}
        </p>

        <audio
          ref={audioRef}
          preload="metadata"
          onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => {
            if (isAudio) setPosition(event.currentTarget.currentTime);
          }}
          onEnded={() => goTo(activeIndex + 1)}
          onError={() => setPlaying(false)}
        />
      </div>
    </div>
  );
}
