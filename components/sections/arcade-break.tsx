import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Arcade } from "@/components/games/arcade";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/aceternity/reveal";
import type { MemoryCard } from "@/lib/games";

export function ArcadeBreak({ deck }: { deck: MemoryCard[] }) {
  return (
    <section className="section-pad border-t border-border">
      <div className="container-page">
        <SectionHeading
          eyebrow="Off the clock"
          title={
            <>
              Press <span className="font-serif font-normal">play</span>.
            </>
          }
          description="Two small games I built from scratch — fly the bamboo road in Flappy Bird, or pair projects and tools in Memory Match. No installs, no accounts; best runs stay in your browser."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/play">
                Full arcade <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          }
        />

        <Reveal className="mt-12">
          <Arcade deck={deck} />
        </Reveal>
      </div>
    </section>
  );
}
