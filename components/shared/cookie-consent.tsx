"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "kd-consent";

export function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const isAdmin = pathname.startsWith("/admin");

  React.useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      const id = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(id);
    }
  }, []);

  function choose(value: "granted" | "essential") {
    localStorage.setItem(KEY, value);
    window.dispatchEvent(new Event("kd-consent-change"));
    setVisible(false);
  }

  if (!visible || isAdmin) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="relative rounded-2xl border border-border bg-card p-4 shadow-2xl">
        <button
          onClick={() => choose("essential")}
          className="absolute right-2.5 top-2.5 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Dismiss cookie notice"
        >
          <X className="size-3.5" />
        </button>
        <div className="flex items-start gap-3 pr-4">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Cookie className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium">A small, honest cookie note</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              I use one anonymous, first-party cookie to count visits. No ads, no tracking
              across sites, no raw IP addresses. You can say no and still read everything.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => choose("granted")} className="h-8 text-xs">
                That&apos;s fine
              </Button>
              <Button size="sm" variant="ghost" onClick={() => choose("essential")} className="h-8 text-xs">
                Essential only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
