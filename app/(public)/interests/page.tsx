import type { Metadata } from "next";
import {
  Camera,
  Mountain,
  Coffee,
  BookOpen,
  Github,
  Music,
  Palette,
  Plane,
  Gamepad2,
  Code2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { interestsFallback } from "@/lib/content";
import { BentoItem } from "@/components/aceternity/bento-grid";
import { Reveal } from "@/components/aceternity/reveal";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Interests",
  description:
    "Things Kushal does away from the keyboard: photography, trail running, espresso, reading, open source and synth music.",
  alternates: { canonical: "/interests" },
};

export const revalidate = 600;

const iconMap: Record<string, LucideIcon> = {
  camera: Camera,
  mountain: Mountain,
  coffee: Coffee,
  book: BookOpen,
  github: Github,
  music: Music,
  palette: Palette,
  plane: Plane,
  gamepad: Gamepad2,
  code: Code2,
};

const gradients = [
  "from-amber-300/20 via-orange-400/10 to-transparent",
  "from-emerald-300/20 via-teal-400/10 to-transparent",
  "from-rose-300/20 via-amber-400/10 to-transparent",
  "from-violet-300/20 via-stone-400/10 to-transparent",
  "from-sky-300/20 via-cyan-400/10 to-transparent",
  "from-stone-300/20 via-emerald-400/10 to-transparent",
];

export default async function InterestsPage() {
  let interests: { id?: string; title: string; description: string; icon: string | null }[] = [];
  try {
    interests = await prisma.interest.findMany({ orderBy: { order: "asc" } });
  } catch {
    interests = [];
  }
  if (interests.length === 0) interests = interestsFallback;

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-brand" /> Off the clock
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
            Things I do when
            <br />
            I&apos;m not <span className="font-serif font-normal">working</span>.
          </h1>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
            None of these are especially serious. They are the things I keep coming back to, and
            occasionally they find their way into the work.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            {interests.map((interest, index) => {
              const Icon = iconMap[interest.icon ?? ""] ?? Sparkles;
              const large = index === 0 || index === 3 || index === 4;
              return (
                <BentoItem
                  key={interest.id ?? interest.title}
                  delay={index * 0.05}
                  className={large ? "md:col-span-2 min-h-[240px]" : "min-h-[200px]"}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} opacity-60`}
                  />
                  <span className="pointer-events-none absolute -bottom-8 -right-4 font-serif text-[9rem] leading-none text-foreground/[0.04]">
                    0{index + 1}
                  </span>
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between">
                      <span className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/60 text-foreground backdrop-blur-sm transition-transform duration-500 group-hover:-rotate-6">
                        <Icon className="size-5" />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        /{interest.title.toLowerCase().replace(/\s+/g, "-")}
                      </span>
                    </div>
                    <div className="mt-auto pt-10">
                      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                        {interest.title}
                      </h2>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        {interest.description}
                      </p>
                    </div>
                  </div>
                </BentoItem>
              );
            })}
          </div>

          <Reveal className="mt-16 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                On the desk
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <p className="font-medium">The Overstory</p>
                  <p className="text-xs text-muted-foreground">Richard Powers</p>
                </li>
                <li>
                  <p className="font-medium">Shape Up</p>
                  <p className="text-xs text-muted-foreground">Ryan Singer</p>
                </li>
                <li>
                  <p className="font-medium">The Dispossessed</p>
                  <p className="text-xs text-muted-foreground">Ursula K. Le Guin</p>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                On repeat
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <p className="font-medium">Music for Airports</p>
                  <p className="text-xs text-muted-foreground">Brian Eno</p>
                </li>
                <li>
                  <p className="font-medium">Promises</p>
                  <p className="text-xs text-muted-foreground">Floating Points & Pharoah Sanders</p>
                </li>
                <li>
                  <p className="font-medium">In Rainbows</p>
                  <p className="text-xs text-muted-foreground">Radiohead</p>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Training for
              </p>
              <p className="mt-4 font-serif text-2xl leading-tight">
                Annapurna 50K
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                October 2026, if my knees agree. Currently at 32km long runs and pretending the hills
                are flat.
              </p>
              <Badge variant="brand" className="mt-4">
                week 14 of 24
              </Badge>
            </div>
          </Reveal>

          <Reveal className="mt-16">
            <p className="text-sm text-muted-foreground">
              That is most of it. If you want the longer version, ask me about any of these and I will
              probably talk for too long.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
