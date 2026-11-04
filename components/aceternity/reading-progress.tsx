"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-brand-strong"
      aria-hidden
    />
  );
}

export function TracingBeam({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 20%", "end 80%"],
  });
  const height = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  return (
    <div ref={ref} className="relative">
      {!reduce && (
        <div
          className="pointer-events-none absolute -left-6 top-0 hidden h-full w-px bg-border xl:block"
          aria-hidden
        >
          <motion.div
            className="w-px bg-gradient-to-b from-brand-strong to-brand"
            style={{ height: "100%", scaleY: height, transformOrigin: "top" }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
