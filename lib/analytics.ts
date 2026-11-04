export function parseUserAgent(ua: string) {
  const device = /iPad|Tablet|PlayBook|Silk/i.test(ua)
    ? "Tablet"
    : /Mobi|Android|iPhone|iPod/i.test(ua)
      ? "Mobile"
      : "Desktop";

  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua)) browser = "Opera";
  else if (/Firefox\//i.test(ua) && !/Seamonkey/i.test(ua)) browser = "Firefox";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

export function isBot(ua: string) {
  return /bot|crawler|spider|crawling|headless|lighthouse|pingdom|uptime|monitoring|preview|facebookexternalhit|slackbot|discordbot|whatsapp/i.test(
    ua,
  ) || ua.trim() === "";
}

export function normalizeReferrer(referrer: string | null, selfHost?: string) {
  if (!referrer) return "Direct";
  try {
    const url = new URL(referrer);
    if (selfHost && url.host === selfHost) return "Internal";
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

export function summarizeVisits(visits: { path: string; referrer: string | null; country: string | null; device: string | null; browser: string | null; os: string | null; visitorId: string }[]) {
  const total = visits.length;
  const unique = new Set(visits.map((v) => v.visitorId)).size;

  const count = (key: keyof (typeof visits)[number]) => {
    const map = new Map<string, number>();
    for (const v of visits) {
      const value = (v[key] as string) || "Unknown";
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  return {
    total,
    unique,
    pages: count("path"),
    referrers: count("referrer"),
    countries: count("country"),
    devices: count("device"),
    browsers: count("browser"),
    systems: count("os"),
  };
}
