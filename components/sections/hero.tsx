"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowDownRight, ArrowUpRight, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/shared/social-links";
import { Spotlight, Sparkles } from "@/components/aceternity/backgrounds";
import { TextGenerateEffect } from "@/components/aceternity/text-effects";
import type { Settings } from "@/lib/settings";

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
  const reduce = useReducedMotion() ?? false;
  const heroRef = React.useRef<HTMLElement>(null);
  const heroCopy = [settings.tagline, settings.heroNote]
    .filter(Boolean)
    .map((line) => line.trim().replace(/[.!?]+$/, ""))
    .join(". ")
    .concat(".");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 55, damping: 22, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 55, damping: 22, mass: 0.4 });
  const portraitX = useTransform(springX, [-0.5, 0.5], [-11, 11]);
  const portraitY = useTransform(springY, [-0.5, 0.5], [-9, 9]);
  const glowX = useTransform(springX, [-0.5, 0.5], [18, -18]);

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onPointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      ref={heroRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative overflow-hidden pb-10 pt-28 sm:pt-40 lg:pb-16 lg:pt-44"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            "radial-gradient(110% 90% at 12% 0%, rgba(126,166,118,0.2) 0%, transparent 58%), radial-gradient(90% 80% at 88% 4%, rgba(92,151,158,0.17) 0%, transparent 55%), radial-gradient(75% 70% at 55% 100%, rgba(172,143,98,0.12) 0%, transparent 62%)",
        }}
      />
      <Spotlight className="-z-10 opacity-80 dark:opacity-100" />
      <Sparkles
        count={28}
        className="-z-10 opacity-50 dark:opacity-100 dark:[&_span]:bg-brand dark:[&_span]:shadow-[0_0_10px_var(--brand)]"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden dark:block">
        <motion.div
          animate={
            reduce
              ? undefined
              : { x: [0, 26, 0], y: [0, -18, 0], scale: [1, 1.08, 1], opacity: [0.45, 0.75, 0.45] }
          }
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-24 top-0 size-[32rem] rounded-full bg-[radial-gradient(circle,rgba(126,166,118,0.3),transparent_66%)] blur-3xl"
        />
        <motion.div
          animate={
            reduce
              ? undefined
              : { x: [0, -30, 0], y: [0, 22, 0], scale: [1, 1.12, 1], opacity: [0.4, 0.68, 0.4] }
          }
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -right-24 top-24 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(92,139,148,0.26),transparent_66%)] blur-3xl"
        />
        <motion.div
          animate={
            reduce
              ? undefined
              : { x: [0, 18, 0], y: [0, -14, 0], scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }
          }
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-0 left-1/3 size-[24rem] rounded-full bg-[radial-gradient(circle,rgba(172,143,98,0.2),transparent_68%)] blur-3xl"
        />
      </div>

      <motion.div
        aria-hidden
        animate={reduce ? undefined : { opacity: [0.18, 0.42, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-[6%] -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand)_26%,transparent),transparent_66%)] blur-3xl hidden dark:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-b from-transparent to-background"
      />

      <div className="container-page relative z-10">
        <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-3 pr-3.5 backdrop-blur-sm">
              <span className="size-1.5 animate-pulse-soft rounded-full bg-brand" />
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
              A <span className="text-foreground">full-stack engineer</span> based in{" "}
              {settings.hometown}.
            </p>

            <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground sm:text-[1.05rem]">
              {reduce ? (
                <span>{heroCopy}</span>
              ) : (
                <TextGenerateEffect words={heroCopy} delay={0.25} />
              )}
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
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[430px] lg:mx-0 lg:justify-self-end"
          >
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[360px] sm:aspect-[4/5] sm:max-w-[420px]">
              <motion.div
                aria-hidden
                style={reduce ? undefined : { x: glowX }}
                className="absolute left-1/2 top-[14%] -z-10 h-[72%] w-[92%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--brand-strong)_42%,transparent),transparent_70%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--brand)_30%,transparent),transparent_70%)]"
              />

              <motion.div
                aria-hidden
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute inset-[4%] -z-10 rounded-full opacity-40 blur-2xl dark:hidden"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--brand) 48%, transparent) 28deg, transparent 76deg, transparent 180deg, color-mix(in oklab, var(--brand) 34%, transparent) 218deg, transparent 270deg)",
                }}
              />

              <motion.div
                aria-hidden
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute inset-[2%] -z-10 hidden rounded-full opacity-90 blur-2xl dark:block"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(185,203,164,0.55) 24deg, rgba(126,166,118,0.35) 52deg, transparent 92deg, transparent 168deg, rgba(92,151,158,0.45) 204deg, rgba(172,143,98,0.28) 236deg, transparent 268deg, rgba(185,203,164,0.3) 330deg, transparent 360deg)",
                }}
              />
              <motion.div
                aria-hidden
                animate={reduce ? undefined : { rotate: -360 }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute inset-[8%] -z-10 hidden rounded-full opacity-70 blur-3xl dark:block"
                style={{
                  background:
                    "conic-gradient(from 140deg, transparent 0deg, rgba(126,166,118,0.28) 40deg, transparent 110deg, rgba(172,143,98,0.22) 190deg, transparent 250deg, rgba(92,151,158,0.3) 310deg, transparent 360deg)",
                }}
              />

              <motion.div
                aria-hidden
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[1%] -z-10 rounded-full border border-dashed border-brand/30 dark:border-brand/60 dark:shadow-[0_0_28px_-8px_var(--brand)]"
              />
              <motion.div
                aria-hidden
                animate={reduce ? undefined : { rotate: -360 }}
                transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[11%] -z-10 rounded-full border border-border/70 dark:border-brand/30"
              />
              <motion.span
                aria-hidden
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[1%] -z-10"
              >
                <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-brand shadow-[0_0_14px_var(--brand)] dark:size-2 dark:shadow-[0_0_18px_4px_var(--brand)]" />
              </motion.span>
              <motion.span
                aria-hidden
                animate={reduce ? undefined : { rotate: -360 }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[11%] -z-10"
              >
                <span className="absolute left-0 top-1/2 size-1 -translate-y-1/2 rounded-full bg-brand/80 shadow-[0_0_10px_var(--brand)] dark:size-1.5 dark:shadow-[0_0_14px_3px_var(--brand)]" />
              </motion.span>

              <motion.div
                style={reduce ? undefined : { x: portraitX, y: portraitY }}
                className="relative size-full"
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, -12, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative size-full"
                >
                  <div
                    className="absolute inset-0 isolate"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, #000 18%, #000 74%, transparent 100%), linear-gradient(to right, transparent 0%, #000 15%, #000 85%, transparent 100%)",
                      maskImage:
                        "linear-gradient(to bottom, transparent 0%, #000 18%, #000 74%, transparent 100%), linear-gradient(to right, transparent 0%, #000 15%, #000 85%, transparent 100%)",
                      WebkitMaskComposite: "source-in",
                      maskComposite: "intersect",
                    }}
                  >
                    <Image
                      src={settings.avatarUrl}
                      alt={`Portrait of ${settings.fullName}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 80vw, 420px"
                      className="object-cover object-[50%_64%] saturate-[0.82] contrast-[1.04] transition-transform duration-[1.2s] ease-out hover:scale-[1.02]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-45 mix-blend-color"
                      style={{
                        background:
                          "linear-gradient(155deg, color-mix(in oklab, var(--brand-strong) 62%, transparent), transparent 58%)",
                      }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent"
                    />
                  </div>
                </motion.div>

                <div className="pointer-events-none absolute inset-x-0 bottom-1 px-3">
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="h-px w-14 bg-gradient-to-r from-brand to-transparent" />
                    <p className="mt-3 font-serif text-3xl leading-none tracking-tight">
                      {settings.fullName}
                    </p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {settings.hometown}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
