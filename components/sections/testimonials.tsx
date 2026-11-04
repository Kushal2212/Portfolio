import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/aceternity/reveal";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <section className="border-t border-border bg-surface/50 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Working together"
          title={
            <>
              A few words from <span className="font-serif font-normal">colleagues</span>.
            </>
          }
          description="People I have worked with over the years, in their own words."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.06}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <blockquote className="text-sm leading-relaxed text-foreground/85">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 border-t border-border/70 pt-5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand-strong/40 font-mono text-[10px] font-semibold text-foreground">
                    {testimonial.initials}
                  </span>
                  <span>
                    <span className="block text-xs font-semibold">{testimonial.name}</span>
                    <span className="block text-[10px] text-muted-foreground">{testimonial.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
