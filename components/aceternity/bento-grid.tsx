"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}>{children}</div>
  );
}

export function BentoItem({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover-lift",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function Meteors({ count = 12, className }: { count?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = `${(i * 100) / count + 4}%`;
        const delay = `${(i % 6) * 0.9}s`;
        const duration = `${5 + (i % 4)}s`;
        return (
          <span
            key={i}
            className="absolute top-0 h-1 w-1 rounded-full bg-brand-strong shadow-[0_0_10px_2px_color-mix(in_oklab,var(--brand-strong)_50%,transparent)]"
            style={{
              left,
              animation: `meteor ${duration} linear infinite`,
              animationDelay: delay,
              opacity: 0,
            }}
          />
        );
      })}
      <style>{`
        @keyframes meteor {
          0% { transform: translate3d(0,0,0) rotate(35deg); opacity: 0; }
          8% { opacity: 1; }
          60% { opacity: 0.8; }
          100% { transform: translate3d(-380px, 620px, 0) rotate(35deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
