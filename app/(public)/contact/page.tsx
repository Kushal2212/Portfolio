import type { Metadata } from "next";
import { ArrowUpRight, Check, Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "@/components/contact/contact-form";
import { CopyEmail } from "@/components/shared/copy-email";
import { SocialLinks } from "@/components/shared/social-links";
import { Reveal } from "@/components/aceternity/reveal";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Kushal Dahal about a project, a role, or a question.",
  alternates: { canonical: "/contact" },
};

const helpItems = [
  "Building a product from an early idea to launch",
  "Frontend architecture and design systems",
  "Performance and accessibility reviews",
  "Technical writing and developer documentation",
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  const subject = params.subject?.slice(0, 120);

  return (
    <>
      <section className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-brand" /> Contact
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
                Say <span className="font-serif font-normal">hello</span>.
              </h1>
              <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
                I am open to freelance projects, collaborations and the occasional full-time
                conversation. Tell me what you are working on and I will give you an honest answer
                about whether I can help.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Badge variant="success">
                <span className="size-1.5 rounded-full bg-emerald-500" /> {settings.availability}
              </Badge>
              <Badge variant="outline">
                <Clock className="size-3" /> Usually a day or two
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page grid gap-9 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <Reveal>
            {subject && (
              <div className="mb-4 rounded-xl border border-brand/25 bg-brand/5 px-4 py-3 text-xs text-brand">
                Regarding: <strong>{subject}</strong>
              </div>
            )}
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1} className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Direct line
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="size-3.5 text-brand" /> Email
                  </p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="mt-1 block text-sm font-medium link-underline"
                  >
                    {settings.email}
                  </a>
                  <div className="mt-2">
                    <CopyEmail email={settings.email} />
                  </div>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="size-3.5 text-brand" /> Phone
                  </p>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="mt-1 block text-sm font-medium link-underline">
                    {settings.phone}
                  </a>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-brand" /> Based in
                  </p>
                  <p className="mt-1 text-sm font-medium">{settings.location}</p>
                </div>
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Elsewhere
                </p>
                <div className="mt-3">
                  <SocialLinks socials={settings.socials} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Good fits
              </p>
              <ul className="mt-4 space-y-2.5">
                {helpItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                Not sure? Just ask. A good question is always welcome, even if there&apos;s no project behind it.
              </p>
            </div>

            <a
              href={settings.resumeUrl}
              download
              className="group flex items-center justify-between rounded-2xl border border-border bg-surface/60 px-5 py-4 text-sm transition-colors hover:border-brand/40"
            >
              Prefer the one-page version?
              <span className="inline-flex items-center gap-1 text-brand">
                Résumé <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
