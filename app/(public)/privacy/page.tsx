import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cookie, Database, Eye, Lock, Mail } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/aceternity/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy & cookies",
  description: "A plain-language explanation of what this site collects, why, and how to opt out.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    icon: Database,
    title: "What is stored",
    body: "When you visit a page and accept the cookie notice, I store an anonymous page view: the path, the referring site, an approximate country (if provided by the hosting network), and general device/browser/OS information. No full IP address is ever written to the database.",
  },
  {
    icon: Cookie,
    title: "Cookies",
    body: "One first-party cookie (kd_vid) holds a random identifier so I can tell unique visits apart from returning ones. It expires after a year and is never shared with anyone. A local preference also remembers your theme and whether you accepted analytics.",
  },
  {
    icon: Eye,
    title: "What is not done",
    body: "No advertising networks, no cross-site tracking, no fingerprinting, no session recording, and no selling or sharing of data. Analytics are read only by the site owner.",
  },
  {
    icon: Mail,
    title: "Contact form",
    body: "If you write to me, your name, email, optional phone number and message are stored so I can reply. Messages are emailed to me through Resend when configured. I keep them only as long as the conversation is useful, and you can ask for deletion at any time.",
  },
  {
    icon: Lock,
    title: "Security",
    body: "Passwords for the admin area are hashed with bcrypt and sessions use signed, HTTP-only cookies. The contact form is rate-limited and protected by a honeypot (and Cloudflare Turnstile when enabled).",
  },
];

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pb-12 pt-32 sm:pt-40">
        <div className="container-page relative z-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Back home
          </Link>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Plain language, no lawyers
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
            Privacy & <span className="font-serif font-normal">cookies</span>.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            This site collects as little as possible and keeps even that private. Here is the full
            picture, written to be understood in one sitting.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Reveal key={section.title} delay={index * 0.04}>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-brand-strong/10 text-brand">
                      <section.icon className="size-4" />
                    </span>
                    <h2 className="text-base font-semibold tracking-tight">{section.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                </div>
              </Reveal>
            ))}

            <Reveal className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold tracking-tight">Your choices</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Choose “Essential only” on the cookie banner to stop all analytics. You can also
                clear the <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">kd_vid</code>{" "}
                cookie and the <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">kd-consent</code>{" "}
                local preference in your browser at any time. To have a message or its metadata deleted, email{" "}
                <a className="text-brand underline underline-offset-2" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
                .
              </p>
            </Reveal>

            <p className="pt-2 text-[10px] text-muted-foreground">
              Last updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
              This is a personal portfolio, not a business. The spirit of the policy matters more
              than its length.
            </p>
          </div>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Questions?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                I&apos;m happy to explain any of this, or delete your data on request.
              </p>
              <Button asChild size="sm" className="mt-4 w-full rounded-full">
                <Link href="/contact">Ask me directly</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
