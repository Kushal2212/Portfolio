import type { Metadata } from "next";
import Link from "next/link";
import { Search, X, ArrowLeft, ArrowRight } from "lucide-react";
import { getFeaturedPost, getPublishedPosts, getTagsWithCounts } from "@/lib/posts";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/aceternity/reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on engineering, design and the everyday work of building software.",
  alternates: { canonical: "/blog" },
};

export const dynamic = "force-dynamic";

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const tag = params.tag ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const isFiltered = Boolean(q || tag);

  const [{ posts, total, totalPages }, tags, featured] = await Promise.all([
    getPublishedPosts({ query: q, tag, page, pageSize: 6 }),
    getTagsWithCounts(),
    isFiltered || page > 1 ? Promise.resolve(null) : getFeaturedPost(),
  ]);

  const featuredId = featured?.id;
  const showFeatured = Boolean(featured) && !isFiltered && page === 1;
  const gridPosts =
    showFeatured && featured && posts.length
      ? posts.filter((p) => p.id !== featuredId).slice(0, 6)
      : posts;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pb-14 pt-32 sm:pt-40">
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-brand" /> The notebook
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
            Notes from
            <br />
            <span className="font-serif font-normal">the work.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
            {total} {total === 1 ? "post" : "posts"} about engineering, design and the small
            decisions that rarely make it into a changelog.
          </p>

          <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <form action="/blog" className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search posts…"
                aria-label="Search posts"
                className="h-11 w-full rounded-full border border-border bg-card/70 pl-10 pr-24 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/40"
              />
              <Button type="submit" size="sm" className="absolute right-1.5 top-1.5 h-8">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/blog"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  !tag
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                All
              </Link>
              {tags.map((t) => (
                <Link
                  key={t.id}
                  href={buildQuery({ q, tag: t.name })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    tag === t.name
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.name}
                  <span className="ml-1.5 text-[10px] opacity-50">{t._count.posts}</span>
                </Link>
              ))}
            </div>
          </div>

          {isFiltered && (
            <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {total} result{total === 1 ? "" : "s"}
                {q && <> for “{q}”</>}
                {tag && <> tagged “{tag}”</>}
              </span>
              <Link href="/blog" className="inline-flex items-center gap-1 text-brand hover:underline">
                <X className="size-3" /> Clear
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          {showFeatured && featured && (
            <Reveal className="mb-12">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-brand-strong/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                  Featured
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <PostCard post={featured} featured />
            </Reveal>
          )}

          {gridPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center">
              <p className="font-serif text-2xl">Nothing here yet.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                No posts match that search. Try a broader term, or browse everything.
              </p>
              <Button asChild variant="outline" className="mt-6 rounded-full">
                <Link href="/blog">Browse all posts</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post, index) => (
                <Reveal key={post.id} delay={(index % 3) * 0.07}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
              <Link
                href={buildQuery({ q, tag, page: page > 2 ? String(page - 1) : undefined })}
                aria-disabled={page === 1}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted",
                  page === 1 && "pointer-events-none opacity-40",
                )}
                aria-label="Previous page"
              >
                <ArrowLeft className="size-4" />
              </Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildQuery({ q, tag, page: p > 1 ? String(p) : undefined })}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-full border text-xs transition-colors",
                    p === page
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-muted",
                  )}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Link>
              ))}
              <Link
                href={buildQuery({ q, tag, page: String(Math.min(totalPages, page + 1)) })}
                aria-disabled={page === totalPages}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted",
                  page === totalPages && "pointer-events-none opacity-40",
                )}
                aria-label="Next page"
              >
                <ArrowRight className="size-4" />
              </Link>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
