import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, Eye } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoverArt } from "@/components/shared/cover-art";
import { Markdown, extractHeadings } from "@/components/blog/markdown";
import { ShareButtons } from "@/components/blog/share-buttons";
import { PostCard } from "@/components/blog/post-card";
import { ReadingProgress, TracingBeam } from "@/components/aceternity/reading-progress";
import { ViewTracker } from "@/components/shared/analytics-tracker";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/aceternity/reveal";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const title = post.seoTitle || post.title;
  const description = post.seoDesc || post.excerpt || undefined;
  const image = post.coverImage ? absoluteUrl(post.coverImage) : absoluteUrl("/og");

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(`/blog/${post.slug}`),
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ["Kushal Dahal"],
      tags: post.tags.map((t) => t.name),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()]);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.tags.map((t) => t.id));
  const headings = extractHeadings(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: settings.fullName, url: absoluteUrl("/") },
    url: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <>
      <ReadingProgress />
      <ViewTracker slug={post.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="pb-24 pt-28 sm:pt-36">
        <div className="container-page">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> All posts
          </Link>

          <header className="mx-auto mt-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${encodeURIComponent(tag.name)}`}>
                  <Badge variant="brand">{tag.name}</Badge>
                </Link>
              ))}
              {post.featured && <Badge variant="outline">Featured</Badge>}
            </div>

            <h1 className="mt-5 text-[2.15rem] font-semibold leading-[1.06] tracking-[-0.04em] sm:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border py-4">
              <div className="flex items-center gap-2.5">
                <span className="relative size-9 overflow-hidden rounded-full">
                  <Image src={settings.avatarUrl} alt={settings.fullName} fill sizes="36px" className="object-cover" />
                </span>
                <span>
                  <span className="block text-xs font-semibold">{settings.fullName}</span>
                  <span className="block text-[10px] text-muted-foreground">{settings.title}</span>
                </span>
              </div>
              <span className="h-4 w-px bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {formatDate(post.publishedAt ?? post.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3.5" /> {post.readingTime} min read
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Eye className="size-3.5" /> {post.views.toLocaleString()} views
              </span>
            </div>
          </header>

          <div className="mx-auto mt-10 max-w-5xl">
            {post.coverImage ? (
              <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-border">
                <Image src={post.coverImage} alt={post.title} fill priority sizes="100vw" className="object-cover" />
              </div>
            ) : (
              <CoverArt seed={post.slug} label={post.tags[0]?.name ?? "Note"} className="aspect-[3/1] w-full rounded-2xl border border-border" />
            )}
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0">
              <TracingBeam>
                <Markdown content={post.content} />
              </TracingBeam>

              <div className="mt-14 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link key={tag.id} href={`/blog?tag=${encodeURIComponent(tag.name)}`}>
                      <Badge variant="outline" className="hover:border-brand/40 hover:text-foreground">
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
                <ShareButtons title={post.title} url={absoluteUrl(`/blog/${post.slug}`)} />
              </div>

              <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border">
                  <Image src={settings.avatarUrl} alt={settings.fullName} fill sizes="64px" className="object-cover" />
                </span>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Written by</p>
                  <p className="mt-1 font-serif text-xl">{settings.fullName}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {settings.tagline}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href="/about">
                    About me <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  On this page
                </p>
                {headings.length > 0 ? (
                  <nav className="mt-4 border-l border-border">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="block border-l-2 border-transparent py-1.5 text-xs leading-snug text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
                        style={{ paddingLeft: heading.level === 3 ? "1.5rem" : "0.9rem" }}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">A short, straight read.</p>
                )}
                <div className="mt-8 border-t border-border pt-5">
                  <Button asChild variant="brand" size="sm" className="w-full rounded-full">
                    <Link href="/contact">Work with me</Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border py-16 md:py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Keep reading"
              title={
                <>
                  Related <span className="font-serif font-normal">posts</span>.
                </>
              }
              action={
                <Button asChild variant="ghost" className="rounded-full">
                  <Link href="/blog">All posts <ArrowUpRight className="size-4" /></Link>
                </Button>
              }
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.id} delay={i * 0.06}>
                  <PostCard post={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
