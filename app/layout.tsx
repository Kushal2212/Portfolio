import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { AnalyticsTracker } from "@/components/shared/analytics-tracker";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";
import { siteConfig } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seoTitle || `${settings.fullName} — ${settings.title}`;
  const description = settings.seoDescription || siteConfig.description;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: title,
      template: `%s — ${settings.fullName}`,
    },
    description,
    authors: [{ name: settings.fullName, url: settings.seoTitle ? undefined : undefined }],
    creator: settings.fullName,
    keywords: [
      settings.fullName,
      "full-stack developer",
      "Next.js developer",
      "interaction designer",
      "portfolio",
      settings.hometown,
      "Nepal",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: absoluteUrl("/"),
      title,
      description,
      siteName: settings.fullName,
      images: [{ url: absoluteUrl("/og"), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/og")],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <AnalyticsTracker />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
