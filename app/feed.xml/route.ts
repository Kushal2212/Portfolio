import { getPublishedPosts } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [{ posts }, settings] = await Promise.all([
    getPublishedPosts({ pageSize: 50 }),
    getSettings(),
  ]);

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const published = new Date(post.publishedAt ?? post.createdAt).toUTCString();
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<pubDate>${published}</pubDate>`,
        `<description>${escapeXml(post.excerpt ?? "")}</description>`,
        ...post.tags.map((tag) => `<category>${escapeXml(tag.name)}</category>`),
        "</item>",
      ].join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(settings.fullName)} — Blog</title>`,
    `<link>${escapeXml(absoluteUrl("/blog"))}</link>`,
    `<description>${escapeXml(settings.seoDescription)}</description>`,
    "<language>en</language>",
    `<atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
