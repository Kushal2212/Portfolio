"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  children,
  className,
  speed = "normal",
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: "normal" | "slow";
  reverse?: boolean;
}) {
  return (
    <div className={cn("group relative flex w-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max min-w-full shrink-0 gap-4 pr-4 group-hover:[animation-play-state:paused]",
          speed === "slow" ? "animate-marquee-slow" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
        )}
      >
        <div className="flex shrink-0 items-stretch gap-4">{children}</div>
        <div className="flex shrink-0 items-stretch gap-4" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
