"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/shared/social-links";
import type { Settings } from "@/lib/settings";
import { cn } from "@/lib/utils";

function LocalTime() {
  const [time, setTime] = React.useState<string>("");
  React.useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kathmandu",
          hour12: false,
        }).format(new Date()),
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
      {time || "—:—"} NPT
    </span>
  );
}

export function Hero({ settings }: { settings: Settings }) {
  return (
    <section className="relative overflow-hidden pb-10 pt-32 sm:pt-40 lg:pb-16 lg:pt-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(58%_52%_at_50%_0%,color-mix(in_oklab,var(--brand-strong)_28%,transparent),transparent_72%)]"
      />

      <div className="container-page relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-3 pr-3.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-brand" />
              <span className="text-[11px] text-muted-foreground">{settings.availability}</span>
            </div>

            <h1 className="mt-7 text-[3.1rem] font-semibold leading-[0.94] tracking-[-0.04em] sm:text-[4.2rem] md:text-[5rem] xl:text-[5.7rem]">
              {settings.fullName.split(/\s+/)[0]}
              {settings.fullName.split(/\s+/).length > 1 && (
                <span className="relative block font-serif font-normal tracking-[-0.02em]">
                  {settings.fullName.split(/\s+/).slice(1).join(" ")}
                </span>
              )}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              A <span className="text-foreground">full-stack engineer</span> {settings.hometown}.
            </p>

            <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground sm:text-[1.05rem]">
              {[settings.tagline, settings.heroNote].filter(Boolean).join(" ")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="brand" className="group">
                <Link href="/blog">
                  Read the blog
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group bg-background/50">
                <Link href="/contact">
                  Say hello
                  <ArrowDownRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="group text-muted-foreground">
                <a href={settings.resumeUrl} download>
                  <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
                  Resume
                </a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <SocialLinks socials={settings.socials} />
              <span className="hidden h-4 w-px bg-border sm:block" />
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" /> {settings.location.split("·")[0]?.trim()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-1 rounded-full bg-muted-foreground/50" />
                  <LocalTime />
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[390px] lg:mx-0 lg:justify-self-end"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-2 shadow-[0_24px_60px_-42px_rgb(var(--shadow-color)/0.45)]">
              <div className="relative aspect-[4/4.7] overflow-hidden rounded-[1.35rem]">
                <Image
                  src={settings.avatarUrl}
                  alt={`Portrait of ${settings.fullName}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 390px"
                  className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-serif text-2xl leading-none">{settings.fullName}</p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">
                    {settings.hometown}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
