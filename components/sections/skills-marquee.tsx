import { Marquee } from "@/components/aceternity/marquee";
import { skills } from "@/lib/content";

export function SkillsMarquee() {
  return (
    <section className="relative border-y border-border py-10">
      <div className="container-page mb-6 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Things I work with
        </p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">
          In roughly the order I reach for them
        </p>
      </div>
      <Marquee className="mask-fade-x" speed="slow">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex shrink-0 items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground/85 transition-colors hover:border-brand/30"
          >
            <span className="size-1.5 rounded-full bg-brand/50" />
            {skill.name}
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
              {skill.group}
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
