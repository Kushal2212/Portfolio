import { getAdminTracks } from "@/lib/music";
import { PageHeader } from "@/components/admin/stat-card";
import { MusicManager } from "@/components/admin/music-manager";

export const metadata = { title: "Music" };
export const dynamic = "force-dynamic";

export default async function AdminMusicPage() {
  const tracks = await getAdminTracks();
  const published = tracks.filter((track) => track.published).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Music"
        description={`${tracks.length} ${tracks.length === 1 ? "entry" : "entries"} · ${published} shown on the public music page`}
      />

      <MusicManager
        tracks={tracks.map((track) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          year: track.year,
          coverUrl: track.coverUrl,
          link: track.link,
          note: track.note,
          published: track.published,
          order: track.order,
        }))}
      />
    </div>
  );
}
