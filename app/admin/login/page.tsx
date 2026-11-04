import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { LoginForm } from "@/components/admin/login-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  if (session) redirect("/admin");

  const showDemo = process.env.NODE_ENV !== "production";

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden border-r border-border bg-surface/40 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_20%,color-mix(in_oklab,var(--brand-strong)_30%,transparent),transparent_70%)]"
        />
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight">
              kushal<span className="text-muted-foreground">.dahal</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
            <ShieldCheck className="size-3 text-brand" /> Private workspace
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] xl:text-5xl">
            Behind
            <br />
            <span className="font-serif font-normal">the site.</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Write, publish and keep an eye on the people who stop by. Everything in one place,
            without touching a line of code.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
            <span>Autosaved drafts</span>
            <span>First-party analytics</span>
            <span>No tracking</span>
          </div>
        </div>

        <p className="relative z-10 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          © {new Date().getFullYear()} {settings.fullName} · Admin v1.0
        </p>
      </div>

      <div className="flex flex-col justify-center px-5 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              kushal<span className="text-muted-foreground">.dahal</span>
            </Link>
            <ThemeToggle />
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Admin panel
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage posts, messages and the site content.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-[10px] text-muted-foreground">
            Protected by rate limiting and HTTP-only sessions.{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
