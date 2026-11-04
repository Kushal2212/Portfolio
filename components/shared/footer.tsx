import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { navLinks } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { SocialLinks } from "@/components/shared/social-links";
import { BackToTop } from "@/components/shared/back-to-top";

export async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border">
      <div className="container-page relative py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              Say hello.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              I like hearing about what people are building, even if there is no project behind it.
            </p>
            <a
              href={`mailto:${settings.email}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium link-underline"
            >
              <Mail className="size-4 text-brand" />
              {settings.email}
            </a>
            <div className="mt-6">
              <SocialLinks socials={settings.socials} />
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-brand"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Elsewhere</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="size-1.5 rounded-full bg-brand" />
                {settings.availability}
              </li>
              <li className="text-muted-foreground">{settings.location}</li>
              <li>
                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  Privacy & cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {year} {settings.fullName}. Built with Next.js and a lot of patience.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono uppercase tracking-wider">{settings.hometown} · {year}</span>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
