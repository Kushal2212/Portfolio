import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/aceternity/reveal";
import type { PostCard as PostCardType } from "@/lib/posts";

export function LatestPosts({ posts }: { posts: PostCardType[] }) {
  return (
    <section className="section-pad border-t border-border">
      <div className="container-page">
        <SectionHeading
          eyebrow="From the notebook"
          title={
            <>
              Recent <span className="font-serif font-normal">writing</span>.
            </>
          }
          description="Notes on building software, designing interfaces, and the occasional detour into process."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/blog">
                All posts <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          }
        />

        {posts.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            The first post is brewing. Check back soon.
          </p>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
