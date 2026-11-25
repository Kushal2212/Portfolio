import type { Metadata } from "next";
import { Gamepad2, Keyboard, Trophy } from "lucide-react";
import { getPublicProjects } from "@/lib/projects";
import { buildProjectDeck, type MemoryPair } from "@/lib/games";
import { Arcade } from "@/components/games/arcade";
import { Reveal } from "@/components/aceternity/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Play",
  description:
    "Two small browser games built from scratch: fly the bamboo gates in Flappy Bird, or pair projects and tools in Memory Match.",
  path: "/play",
  imageTitle: "Press play",
});

export const revalidate = 600;

export default async function PlayPage() {
  const projects = await getPublicProjects();

  const projectPairs: MemoryPair[] = (projects ?? []).map((project) => ({
    name: project.name,
    note: project.summary,
  }));

  const deck = buildProjectDeck(projectPairs);

  return (
    <>
      <section className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-brand" /> Off the clock · Arcade
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
            Press <span className="font-serif font-normal">play</span>.
          </h1>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
            Two small games I built for the fun of it. No libraries, no accounts, no leaderboard —
            just a canvas, a stubborn bird, and a few minutes of pretending not to be working.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Gamepad2 className="size-3.5 text-brand" /> 2 games
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Keyboard className="size-3.5" /> Space, arrows, mouse or touch
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="size-3.5" /> Best runs saved in your browser
            </span>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <Reveal>
            <Arcade deck={deck} />
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page">
          <Reveal className="grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                The build
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Canvas and plain React state. The flappy bird runs its own animation loop with
                parallax hills and bamboo gates, and the memory deck is dealt from real project
                notes.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                The scores
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Personal bests live in localStorage on this device. Nothing is posted, tracked or
                shared anywhere.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                The point
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A short break, and a small reminder that the same care goes into the serious
                pages too.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
