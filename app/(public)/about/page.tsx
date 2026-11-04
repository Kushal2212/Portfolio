import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Download,
  MapPin,
  Clock,
  Coffee,
  GraduationCap,
} from "lucide-react";
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
  const school = settings.education
    .split(",")
    .map((part) => part.trim())
    .slice(1);
  const aboutTimeline = timeline.map((item) =>
    item.kind === "education"
      ? {
          ...item,
          title: item.title,
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
                and I care how it{" "}
                <span className="font-serif font-normal">feels</span>.
              </h1>
              <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground">
                I&apos;m {settings.fullName.split(" ")[0]}, a BSc. CSIT student from{" "}
                {settings.hometown} who got interested in computers long before
                figuring out what to actually do with them. I&apos;m into full-stack
                development, backend engineering, and occasionally convincing
                myself that fixing one bug won&apos;t take the entire evening. I
                enjoy building things that solve real problems, whether it&apos;s an
                AI-powered cardamom disease detection system or an anonymous
                feedback web app. Most of my learning happens through
                experimenting, breaking things, fixing them, and watching Chai
                aur Code videos (sometimes even understanding everything on the
                first watch).
              </p>
              <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
                When I&apos;m not writing code or wondering why something worked
                yesterday but doesn&apos;t today, you&apos;ll probably find me watching
                football or cricket. Still learning, still building, and
                definitely still Googling things I probably should remember by
                now.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="brand" className="rounded-full">
                  <a href={settings.resumeUrl} download>
                    <Download className="size-4" /> Download resume
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
                    <p className="mt-1 font-serif text-2xl">
                      {settings.fullName}
                    </p>
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
              I&apos;m a BSc. CSIT student with a passion for computer science and
              technology that started in childhood. I enjoy turning ideas into
              practical projects, from building an AI-powered cardamom disease
              detection system to developing an anonymous feedback web
              application.
            </p>

            <p>
              I&apos;m always curious to learn something new, whether it&apos;s exploring
              backend development, experimenting with new technologies, or
              watching tech tutorials from creators like Chai aur Code. Beyond
              coding, I enjoy watching and playing sports, especially football
              and cricket.
            </p>
            <p className="text-sm text-muted-foreground">
              I believe in learning by building, staying curious, and
              continuously improving as a developer.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-border">
        <div className="container-page py-8">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/studio.jpeg"
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
            <Reveal
              delay={0.1}
              className="mt-8 hidden rounded-2xl border border-border bg-card p-5 lg:block"
            >
              <p className="flex items-center gap-2 text-xs font-medium">
                <MapPin className="size-3.5 text-brand" /> {settings.hometown}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="size-3.5" /> {settings.education}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> UTC+5:45. I overlap with Europe
                in the morning.
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Coffee className="size-3.5" /> Usually online by 9am, coffee
                nearby
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
                What I build{" "}
                <span className="font-serif font-normal">with</span>.
              </>
            }
            description="Mostly the React ecosystem, with enough backend experience to be useful on both sides."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {skillGroups.map((group, i) => (
              <Reveal key={group.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-base font-semibold tracking-tight">
                    {group.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {group.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
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
                <li
                  key={cert.name}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span>
                    {cert.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      · {cert.issuer}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {cert.year}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
