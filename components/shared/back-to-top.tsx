"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 transition-colors hover:border-brand/40 hover:text-foreground"
      aria-label="Back to top"
    >
      Top
      <ArrowUp className="size-3 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}
