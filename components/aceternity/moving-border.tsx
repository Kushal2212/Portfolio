"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Rotating conic-gradient border. Pure CSS so it stays cheap: one small
 * animated layer behind an opaque content panel.
 */
export function MovingBorder({
  children,
  className,
  innerClassName,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  as?: "div" | "span";
}) {
  return (
    <Tag
      className={cn(
        "relative inline-flex overflow-hidden rounded-full p-[1.5px]",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,var(--brand-strong)_0%,transparent_18%,transparent_50%,var(--brand-strong)_68%,transparent_86%,var(--brand-strong)_100%)]"
      />
      <span
        className={cn(
          "relative z-10 inline-flex size-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground backdrop-blur-xl",
          innerClassName,
        )}
      >
        {children}
      </span>
    </Tag>
  );
}

export function GlowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative", className)}>
      <div
        aria-hidden
        className="absolute -inset-px rounded-[calc(1rem+1px)] bg-gradient-to-br from-brand-strong/40 via-transparent to-violet-500/20 opacity-0 blur-[2px] transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative h-full rounded-2xl border border-border bg-card transition-transform duration-500 group-hover:-translate-y-1">
        {children}
      </div>
    </div>
  );
}
