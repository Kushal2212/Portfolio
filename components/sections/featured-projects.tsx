import Link from "next/link";
import { ArrowUpRight, ExternalLink, Github } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/aceternity/reveal";
import { CoverArt } from "@/components/shared/cover-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ProjectCard = {
  slug: string;
  name: string;
  year: string;
  summary: string;
  tags: string[];
  coverImage?: string | null;
  href?: string | null;
  repo?: string | null;
  metric?: string | null;
  metricLabel?: string | null;
  status: string;
};

export function FeaturedProjects({
  items,
  githubUrl,
}: {
  items: ProjectCard[];
  githubUrl?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="section-pad relative overflow-hidden border-t border-border">
      <div className="container-page">
        <SectionHeading
          eyebrow="Selected work"
          title={
            <>
              A few things I&apos;ve <span className="font-serif font-normal">made</span>.
            </>
          }
          description="Small products and side projects, mostly built to answer a question I had. More is available on request."
          action={
            githubUrl ? (
              <Button asChild variant="outline" className="rounded-full">
                <a href={githubUrl} target="_blank" rel="noreferrer noopener">
                  <Github className="size-4" /> More on GitHub
                </a>
              </Button>
            ) : undefined
          }
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.06}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-500 hover:border-brand/25">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {project.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.coverImage}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <CoverArt
                      seed={project.slug}
                      className="size-full transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  )}
                  <div className="absolute right-3 top-3">
                    <Badge variant={project.status === "Open source" ? "violet" : "default"} className="backdrop-blur-md">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="absolute inset-x-3 bottom-3 flex items-end justify-between">
                    <span className="rounded-full bg-black/30 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-white/80 backdrop-blur-md">
                      {project.year}
                    </span>
                    {project.metric && (
                      <span className="text-right">
                        <span className="block text-base font-semibold leading-none text-white">{project.metric}</span>
                        {project.metricLabel && (
                          <span className="mt-1 block text-[9px] uppercase tracking-wider text-white/60">{project.metricLabel}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">{project.name}</h3>
                    <span className="mt-1 font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4">
                    <Link
                      href={`/contact?subject=${encodeURIComponent(`Question about ${project.name}`)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-foreground/80 transition-colors hover:text-brand"
                    >
                      Ask about this project
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                    <div className="flex items-center gap-3">
                      {project.href && project.href !== "#" && (
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/70 transition-colors hover:text-brand"
                        >
                          Visit
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                      {project.repo && (
                        <a
                          href={project.repo}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`${project.name} on GitHub`}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Github className="size-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
