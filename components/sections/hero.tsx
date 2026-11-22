"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/shared/social-links";
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
      {time ? `${time} NPT` : "\u00A0"}
    </span>
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

/**
 * Same behaviour as Motion's hook, but with a server snapshot so the first
 * client render matches the server output. Reading matchMedia synchronously
 * during hydration makes React throw a text mismatch on reduced-motion devices.
 */
function useHeroReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

type NameChar = {
  el: HTMLElement;
  weight: number;
  x: number;
  y: number;
  applied: string;
};

/**
 * Splits the name into word rows and character spans, then reacts to the
 * cursor. Letters get bolder and wider near the pointer; as soon as the
 * pointer moves away they settle back to a static weight.
 */
function HeroName({ name, reduce }: { name: string; reduce: boolean }) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const words = React.useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length ? parts : [name];
  }, [name]);

  React.useEffect(() => {
    if (reduce) return;

    const heading = headingRef.current;
    if (!heading) return;

    const DEFAULT_WEIGHT = 350;
    const chars: NameChar[] = Array.from(
      heading.querySelectorAll<HTMLElement>("[data-hero-char]"),
    ).map((el) => ({
      el,
      weight: DEFAULT_WEIGHT,
      x: 0,
      y: 0,
      applied: "",
    }));

    if (!chars.length) return;

    let pointerX = -10_000;
    let pointerY = -10_000;
    let hasPointer = false;
    let needsMeasure = true;
    let frame = 0;
    let running = false;
    let cancelled = false;
    let bounds = { left: 0, top: 0, right: 0, bottom: 0 };

    const measure = () => {
      const headingRect = heading.getBoundingClientRect();
      bounds = {
        left: headingRect.left,
        top: headingRect.top,
        right: headingRect.right,
        bottom: headingRect.bottom,
      };
      for (const char of chars) {
        const rect = char.el.getBoundingClientRect();
        char.x = rect.left + rect.width / 2;
        char.y = rect.top + rect.height / 2;
      }
      needsMeasure = false;
    };

    const tick = () => {
      if (cancelled) return;
      if (needsMeasure) measure();

      const radius = Math.max(180, window.innerWidth * 0.16);
      const nearName =
        hasPointer &&
        pointerX > bounds.left - 220 &&
        pointerX < bounds.right + 220 &&
        pointerY > bounds.top - 160 &&
        pointerY < bounds.bottom + 160;

      let settled = true;

      for (const char of chars) {
        let target = DEFAULT_WEIGHT;

        if (nearName) {
          // Near the cursor: bolder and wider, with a soft falloff.
          const distance = Math.hypot(
            pointerX - char.x,
            (pointerY - char.y) * 0.8,
          );
          let falloff = Math.max(0, 1 - distance / radius);
          falloff = falloff * falloff * (3 - 2 * falloff);
          target = 200 + 600 * falloff;
        }

        char.weight += (target - char.weight) * 0.16;
        if (Math.abs(target - char.weight) < 0.4) {
          char.weight = target;
        } else {
          settled = false;
        }

        const weight = Math.round(char.weight);
        const width = Math.round(75 + 25 * ((char.weight - 200) / 600));
        const settings = `"wght" ${weight}, "wdth" ${width}`;
        if (settings !== char.applied) {
          char.el.style.fontVariationSettings = settings;
          char.applied = settings;
        }
      }

      if (settled) {
        running = false;
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    const ensureRunning = () => {
      if (running || cancelled) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      hasPointer = true;
      needsMeasure = true;
      ensureRunning();
    };

    const onPointerEnd = () => {
      hasPointer = false;
      ensureRunning();
    };

    const onPointerOut = (event: MouseEvent) => {
      if (!event.relatedTarget) onPointerEnd();
    };

    const queueMeasure = () => {
      needsMeasure = true;
    };

    measure();

    // Re-measure after the rise animation and once webfonts settle, so the
    // proximity circles use the final glyph positions.
    const settle = window.setTimeout(measure, 1_400);
    if (document.fonts) {
      void document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    window.addEventListener("blur", onPointerEnd);
    window.addEventListener("scroll", queueMeasure, { passive: true });
    window.addEventListener("resize", queueMeasure);
    window.addEventListener("mouseout", onPointerOut);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      window.removeEventListener("blur", onPointerEnd);
      window.removeEventListener("scroll", queueMeasure);
      window.removeEventListener("resize", queueMeasure);
      window.removeEventListener("mouseout", onPointerOut);
    };
  }, [name, reduce]);

  let charIndex = 0;

  return (
    <h1 ref={headingRef} className="hero-name" aria-label={name}>
      {words.map((word, rowIndex) => (
        <span className="hero-name-row" aria-hidden="true" key={`${word}-${rowIndex}`}>
          {Array.from(word).map((character, index) => (
            <span
              key={`${character}-${index}`}
              className="hero-name-char"
              data-hero-char
              style={{ "--i": charIndex++ } as React.CSSProperties}
            >
              {character}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

/**
 * Portrait with an upward wipe reveal, a floating morphing frame, cursor tilt,
 * a soft light sheen and a spinning availability badge.
 */
function HeroPhoto({
  src,
  name,
  reduce,
}: {
  src: string;
  name: string;
  reduce: boolean;
}) {
  const frameRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reduce) return;

    const frame = frameRef.current;
    if (!frame) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      const rotateY = (event.clientX / window.innerWidth - 0.5) * 14;
      const rotateX = (0.5 - event.clientY / window.innerHeight) * 10;
      const rect = frame.getBoundingClientRect();
      const sheenX = ((event.clientX - rect.left) / rect.width) * 100;
      const sheenY = ((event.clientY - rect.top) / rect.height) * 100;

      frame.style.setProperty("--ry", `${rotateY.toFixed(1)}deg`);
      frame.style.setProperty("--rx", `${rotateX.toFixed(1)}deg`);
      frame.style.setProperty("--mx", `${sheenX.toFixed(0)}%`);
      frame.style.setProperty("--my", `${sheenY.toFixed(0)}%`);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reduce]);

  return (
    <div className="hero-photo">
      <div ref={frameRef} className="hero-photo-frame">
        <Image
          src={src}
          alt={`Portrait of ${name}`}
          fill
          priority
          sizes="(max-width: 1024px) 80vw, 420px"
          className="object-cover object-[50%_38%]"
        />
      </div>

      <svg className="hero-badge" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <defs>
          <path
            id="hero-badge-ring"
            d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
          />
        </defs>
        <circle
          cx="60"
          cy="60"
          r="58"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text>
          <textPath href="#hero-badge-ring">
            Open for work • Open for work •{" "}
          </textPath>
        </text>
        <circle className="hero-badge-dot" cx="60" cy="60" r="6" />
      </svg>
    </div>
  );
}

export function Hero({ settings }: { settings: Settings }) {
  const reduce = useHeroReducedMotion();
  const heroCopy = [settings.tagline, settings.heroNote]
    .filter(Boolean)
    .map((line) => line.trim().replace(/[.!?]+$/, ""))
    .join(". ")
    .concat(".");

  return (
    <section className="relative overflow-hidden pb-10 pt-28 sm:pt-40 lg:pb-16 lg:pt-44">
      <div className="container-page relative z-10">
        <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-3 pr-3.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-brand" />
              <span className="text-[11px] text-muted-foreground">{settings.availability}</span>
            </div>

            <div className="mt-6">
              <HeroName name={settings.fullName} reduce={reduce} />
            </div>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              A <span className="text-foreground">full-stack engineer</span> based in{" "}
              {settings.hometown}.
            </p>

            <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground sm:text-[1.05rem]">
              {heroCopy}
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
          </div>

          <div className="relative mx-auto w-full max-w-[430px] lg:mx-0 lg:justify-self-end">
            <HeroPhoto
              src={settings.avatarUrl}
              name={settings.fullName}
              reduce={reduce}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
