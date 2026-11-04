import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { Reveal } from "@/components/aceternity/reveal";
import { Button } from "@/components/ui/button";
import type { Settings } from "@/lib/settings";

export function ContactCTA({ settings }: { settings: Settings }) {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(50%_60%_at_50%_100%,color-mix(in_oklab,var(--brand-strong)_24%,transparent),transparent_72%)]"
      />

      <div className="container-page relative py-24 md:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand" />
            {settings.availability}
          </div>

          <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl md:text-6xl">
            Want to work
            <br />
            <span className="font-serif font-normal">together?</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
            If you have a project, a role, or a question I might be able to help with, send me a note.
            I read everything and reply when I can.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="brand">
              <Link href="/contact">
                Get in touch
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-full text-muted-foreground">
              <a href={`mailto:${settings.email}`}>
                <Mail className="size-4" /> {settings.email}
              </a>
            </Button>
          </div>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {settings.hometown} · working remotely · usually online by 9am
          </p>
        </Reveal>
      </div>
    </section>
  );
}
