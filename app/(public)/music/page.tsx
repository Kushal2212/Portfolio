import type { Metadata } from "next";
import { Disc3, Headphones, Music2 } from "lucide-react";
import { getPublishedTracks } from "@/lib/music";
import { getSettings } from "@/lib/settings";
import { TrackGrid } from "@/components/music/track-grid";
import { Reveal } from "@/components/aceternity/reveal";

export const metadata: Metadata = {
  title: "Music",
  description:
    "Albums, tracks and playlists on repeat — the soundtrack to long build sessions and slow mornings.",
  alternates: { canonical: "/music" },
};

export const revalidate = 60;

export default async function MusicPage() {
  const [tracks, settings] = await Promise.all([getPublishedTracks(), getSettings()]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Music on repeat",
    itemListElement: tracks.map((track, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MusicRecording",
        name: track.title,
        byArtist: { "@type": "MusicGroup", name: track.artist },
        ...(track.album ? { inAlbum: { "@type": "MusicAlbum", name: track.album } } : {}),
        ...(track.link ? { url: track.link } : {}),
      },
    })),
  };

  return (
    <>
      {tracks.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
        />
      )}

      <section className="relative overflow-hidden pb-14 pt-32 sm:pt-40">
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-brand" /> Listening
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
            Sounds on
            <br />
            <span className="font-serif font-normal">repeat</span>.
          </h1>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
            Albums, tracks and playlists that keep the work moving. Mostly for long build sessions,
            slow mornings and the walk back home.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Music2 className="size-3.5 text-brand" /> {tracks.length}{" "}
              {tracks.length === 1 ? "entry" : "entries"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Headphones className="size-3.5" /> Curated by {settings.fullName}
            </span>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page">
          {tracks.length === 0 ? (
            <Reveal>
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-24 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Disc3 className="size-6" />
                </span>
                <p className="mt-5 font-serif text-2xl">Nothing on the turntable yet.</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  The first record will land here soon. In the meantime, the rest of the site is a
                  good place to wander.
                </p>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <TrackGrid tracks={tracks} />
            </Reveal>
          )}

          <Reveal className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Updated whenever something stays on repeat long enough.</p>
            <p className="font-mono uppercase tracking-[0.16em]">
              {settings.fullName} · listening
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
