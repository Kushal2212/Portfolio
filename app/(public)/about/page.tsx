import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Download, MapPin, Clock, Coffee, GraduationCap } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { skillGroups, timeline, certifications } from "@/lib/content";
import { SectionHeading } from "@/components/shared/section-heading";
import { Timeline } from "@/components/aceternity/timeline";
import { Reveal } from "@/components/aceternity/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/shared/social-links";

export const metadata: Metadata = {
  title: "About",
  description:
    "A little more about Kushal Dahal: how he started building websites, what he works on now, and how he likes to work.",
  alternates: { canonical: "/about" },
};

export const revalidate = 600;

export default async function AboutPage() {
  const settings = await getSettings();
  const [degree, ...school] = settings.education.split(",").map((part) => part.trim());
  const aboutTimeline = timeline.map((item) =>
    item.kind === "education"
      ? {
          ...item,
          title:  item.title,
          org: school.join(", ") || item.org,
          location: settings.hometown || item.location,
        }
      : item,
  );

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-brand" /> About me
          </div>

          <div className="mt-6 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
                I build for the web,
                <br />
                and I care how it <span className="font-serif font-normal">feels</span>.
              </h1>
              <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground">
                I&apos;m {settings.fullName.split(" ")[0]}, a full-stack engineer and interaction
                designer from {settings.hometown}. I have spent the last six years between product, design and
                engineering, mostly helping small teams turn messy ideas into something people can use.
              </p>
              <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
                I started out making websites for cultural organisations in Nepal. I learned to build
                backends because I was tired of waiting for them, and never really stopped doing both.
                These days I work on frontend architecture at Fathom Labs, keep a small UI library
                going, and write when I have something worth saying.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="brand" className="rounded-full">
                  <a href={settings.resumeUrl} download>
                    <Download className="size-4" /> Download résumé
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/contact">
                    Say hello <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8">
                <SocialLinks socials={settings.socials} />
              </div>
            </div>

            <Reveal className="relative mx-auto w-full max-w-sm lg:mx-0">
              <div className="overflow-hidden rounded-[2rem] border border-border bg-card p-2.5 shadow-[0_40px_80px_-50px_rgba(0,0,0,0.5)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem]">
                  <Image
                    src={settings.avatarUrl}
                    alt={`${settings.fullName} portrait`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 80vw, 380px"
                    className="object-cover grayscale-[25%] transition-all duration-700 hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">
                      {settings.hometown}
                    </p>
                    <p className="mt-1 font-serif text-2xl">{settings.fullName}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

         
        </div>
      </section>

      <section className="section-pad border-t border-border">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="How I got here"
            title={
              <>
                A slow path into
                <br />
                <span className="font-serif font-normal">building things</span>.
              </>
            }
          />
          <Reveal className="space-y-5 text-[0.98rem] leading-[1.85] text-muted-foreground">
            <p>
              My first website was a tribute page to a football team, built in a cyber café in
              Madi on a dial-up connection that dropped every few minutes. I was thirteen. I
              still remember how strange it felt to make something and then find it somewhere in the
              world.
            </p>
            <p>
              At university I studied computer science, but most of what I cared about happened
              outside the syllabus: a student magazine site, a hackathon for public transport data, a
              reading list app nobody asked for. That pattern carried into my career. I kept drifting
              toward teams where engineering and design were part of the same conversation.
            </p>
            <p>
              These days I am most useful when a product needs someone who can see the whole thing at
              once: the data model, the API, the empty states, the loading screen, the one line of copy
              that makes it make sense. I like simple infrastructure, obvious interfaces, and software
              that does not make people feel stupid.
            </p>
            <p className="text-sm text-muted-foreground">
              I still get the same feeling when something I made goes live. It has not worn off.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-border">
        <div className="container-page py-8">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/studio.jpg"
              alt="A collaborative studio workspace with people working together"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 text-white sm:p-8">
              <p className="max-w-md font-serif text-xl sm:text-2xl">
                A studio day, somewhere between the sketch and the deploy.
              </p>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">
                2025
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-border">
        <div className="container-page grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <SectionHeading
              eyebrow="The path"
              title={
                <>
                  My <span className="font-serif font-normal">Journey</span>.
                </>
              }
              description="A short version of the last few years. The longer one usually comes up over coffee."
            />
            <Reveal delay={0.1} className="mt-8 hidden rounded-2xl border border-border bg-card p-5 lg:block">
              <p className="flex items-center gap-2 text-xs font-medium">
                <MapPin className="size-3.5 text-brand" /> {settings.hometown}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="size-3.5" /> {settings.education}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> UTC+5:45. I overlap with Europe in the morning.
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Coffee className="size-3.5" /> Usually online by 9am, coffee nearby
              </p>
            </Reveal>
          </div>
          <Timeline items={aboutTimeline} />
        </div>
      </section>

      

      <section className="section-pad border-t border-border">
        <div className="container-page">
          <SectionHeading
            eyebrow="Toolbox"
            title={
              <>
                What I build <span className="font-serif font-normal">with</span>.
              </>
            }
            description="Mostly the React ecosystem, with enough backend experience to be useful on both sides."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {skillGroups.map((group, i) => (
              <Reveal key={group.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-base font-semibold tracking-tight">{group.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{group.description}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 rounded-2xl border border-border bg-card p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Certifications
            </p>
            <ul className="mt-4 divide-y divide-border">
              {certifications.map((cert) => (
                <li key={cert.name} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span>
                    {cert.name}
                    <span className="ml-2 text-xs text-muted-foreground">· {cert.issuer}</span>
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{cert.year}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
