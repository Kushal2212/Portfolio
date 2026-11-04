"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TimelineItem } from "@/lib/content";

export function Timeline({ items }: { items: TimelineItem[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border md:left-[9px]" />
      <motion.div
        className="absolute left-[7px] top-2 w-px origin-top bg-gradient-to-b from-brand-strong via-brand to-transparent md:left-[9px]"
        style={{ bottom: 8 }}
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: reduce ? 0 : 1.8, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="space-y-10">
        {items.map((item, index) => (
          <motion.div
            key={`${item.title}-${item.period}`}
            initial={{ opacity: 0, x: reduce ? 0 : 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative pl-9 md:pl-12"
          >
            <span
              className={cn(
                "absolute left-0 top-1.5 flex size-4 items-center justify-center rounded-full border-2 border-background bg-brand-strong md:size-5",
                item.kind === "education" && "bg-violet-500",
              )}
            >
              <span className="size-1.5 rounded-full bg-brand-foreground md:size-2" />
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {item.period}
              </span>
              <Badge variant={item.kind === "education" ? "violet" : "brand"}>
                {item.kind === "education" ? "Education" : "Work"}
              </Badge>
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight md:text-xl">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.org} <span className="text-border">/</span> {item.location}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
