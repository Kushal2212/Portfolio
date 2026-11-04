import Link from "next/link";
import { ArrowUpRight, Clock, Globe2, GraduationCap, Mail, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { BentoGrid, BentoItem } from "@/components/aceternity/bento-grid";
import { SocialLinks } from "@/components/shared/social-links";
import { CopyEmail } from "@/components/shared/copy-email";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/aceternity/reveal";
import type { Settings } from "@/lib/settings";

export function PersonalDetails({ settings }: { settings: Settings }) {
  return (
    <section className="section-pad relative">
      <div className="container-page">
        <SectionHeading
          eyebrow="A little about me"
          title={
            <>
              The short <span className="font-serif font-normal">version</span>.
            </>
          }
          description="Who I am, how I work, and the quickest ways to get in touch."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/about">
                The longer story <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          }
        />

        <BentoGrid className="mt-12 md:grid-cols-6">
          <BentoItem className="md:col-span-4 md:row-span-2">
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  In a few lines
                </span>
                <p className="mt-4 text-xl leading-relaxed tracking-tight text-foreground/90 sm:text-[1.35rem]">
                  {settings.bio}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                  <MapPin className="size-3.5" /> {settings.hometown}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                  <GraduationCap className="size-3.5" /> {settings.education}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                  <Globe2 className="size-3.5" /> Remote-friendly
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                  <Clock className="size-3.5" /> Replies in a day or two
                </span>
              </div>
            </div>
          </BentoItem>

          <BentoItem delay={0.05} className="md:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Right now
            </span>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">{settings.heroNote}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-strong/20 px-3 py-1.5 text-[11px] text-brand">
              <span className="size-1.5 rounded-full bg-brand" />
              {settings.availability}
            </div>
          </BentoItem>

          <BentoItem delay={0.1} className="md:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Say hello
            </span>
            <a
              href={`mailto:${settings.email}`}
              className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-brand"
            >
              <Mail className="size-4 text-brand" />
              {settings.email}
            </a>
            <div className="mt-4">
              <CopyEmail email={settings.email} />
            </div>
          </BentoItem>

          <BentoItem delay={0.15} className="md:col-span-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Find me elsewhere
            </span>
            <p className="mt-3 text-sm text-muted-foreground">
              I am most active on GitHub and LinkedIn. Messages are welcome.
            </p>
            <div className="mt-5">
              <SocialLinks socials={settings.socials} />
            </div>
          </BentoItem>

          <BentoItem delay={0.2} className="md:col-span-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Off the clock
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Running, film photography, espresso and a reading pile that grows faster than I can finish it.
            </p>
            <Link
              href="/interests"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground link-underline"
            >
              See what keeps me curious <ArrowUpRight className="size-3.5" />
            </Link>
          </BentoItem>
        </BentoGrid>

        <Reveal className="mt-6">
          <p className="text-sm text-muted-foreground">
            The best way to find out if we work well together is a short conversation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
