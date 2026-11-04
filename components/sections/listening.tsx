import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { TrackGrid } from "@/components/music/track-grid";
import { Button } from "@/components/ui/button";
import type { MusicTrack } from "@/lib/music";

export function Listening({ tracks }: { tracks: MusicTrack[] }) {
  if (tracks.length === 0) return null;

  return (
    <section className="section-pad border-t border-border">
      <div className="container-page">
        <SectionHeading
          eyebrow="On repeat"
          title={
            <>
              The current <span className="font-serif font-normal">soundtrack</span>.
            </>
          }
          description="Albums and tracks that have been keeping me company while building, writing and walking."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/music">
                All music <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          }
        />

        <div className="mt-12">
          <TrackGrid tracks={tracks} />
        </div>
      </div>
    </section>
  );
}
