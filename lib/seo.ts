import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

/**
 * Builds page-level metadata with a unique canonical URL and a matching
 * Open Graph image. Without this, child pages inherit the home page's
 * `og:title`, `og:description` and `og:url`.
 */
export function pageMetadata({
  title,
  description,
  path,
  imageTitle,
}: {
  title: string;
  description: string;
  path: string;
  imageTitle?: string;
}): Metadata {
  const image = absoluteUrl(`/og?title=${encodeURIComponent(imageTitle ?? title)}`);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: { "application/rss+xml": "/feed.xml" },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: absoluteUrl(path),
      siteName: "Kushal Dahal",
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
