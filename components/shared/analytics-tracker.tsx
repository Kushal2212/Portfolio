"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

function hasConsent() {
  return localStorage.getItem("kd-consent") === "granted";
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  React.useEffect(() => {
    let cancelled = false;

    async function track() {
      if (!hasConsent()) return;
      const key = `kd-view:${pathname}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");

      try {
        await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pathname, referrer: document.referrer }),
          keepalive: true,
        });
      } catch {
        // Analytics should never break the page.
      }
    }

    track();

    const onConsent = () => {
      if (!cancelled) {
        sessionStorage.removeItem(`kd-view:${pathname}`);
        track();
      }
    };
    window.addEventListener("kd-consent-change", onConsent);
    return () => {
      cancelled = true;
      window.removeEventListener("kd-consent-change", onConsent);
    };
  }, [pathname]);

  return null;
}

export function ViewTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    const key = `kd-post-view:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/posts/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
