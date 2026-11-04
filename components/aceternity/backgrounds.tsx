"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function Spotlight({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -top-1/4 left-1/2 h-[52rem] w-[52rem] -translate-x-1/2"
      >
        <div
          className={cn(
            "size-full rounded-full blur-[90px]",
            reduce ? "" : "animate-pulse-soft",
          )}
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--brand-strong) 26%, transparent) 0%, transparent 62%)",
          }}
        />
      </motion.div>
      <div className="absolute left-1/2 top-0 h-[38rem] w-[70rem] -translate-x-1/2 -translate-y-1/3 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--brand-strong)_10%,transparent),transparent_65%)]" />
    </div>
  );
}

export function GridBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-0 bg-grid mask-radial opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

export function AuroraBackground({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className={cn(
          "absolute -left-24 top-10 h-[30rem] w-[30rem] rounded-full blur-[110px]",
          !reduce && "animate-aurora",
        )}
        style={{ background: "color-mix(in oklab, var(--brand-strong) 22%, transparent)" }}
      />
      <div
        className={cn(
          "absolute -right-20 top-1/3 h-[26rem] w-[26rem] rounded-full blur-[120px]",
          !reduce && "animate-aurora [animation-delay:-7s]",
        )}
        style={{ background: "rgba(139,92,246,0.16)" }}
      />
      <div
        className={cn(
          "absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full blur-[130px]",
          !reduce && "animate-aurora [animation-delay:-13s]",
        )}
        style={{ background: "rgba(56,189,248,0.12)" }}
      />
    </div>
  );
}

export function Sparkles({ count = 26, className }: { count?: number; className?: string }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    return {
      left: `${(rnd * 100).toFixed(2)}%`,
      top: `${((rnd * 71 + i * 3.7) % 100).toFixed(2)}%`,
      delay: `${((i * 0.37) % 4).toFixed(2)}s`,
      size: i % 4 === 0 ? 3 : 2,
      duration: `${(2.4 + (i % 5) * 0.6).toFixed(1)}s`,
    };
  });

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {dots.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-brand-strong animate-pulse-soft"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            animationDelay: dot.delay,
            animationDuration: dot.duration,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}
