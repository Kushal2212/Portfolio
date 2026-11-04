import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import { CoverArt } from "@/components/shared/cover-art";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import type { PostCard as PostCardType } from "@/lib/posts";

export function PostCard({
  post,
  featured = false,
  className,
}: {
  post: PostCardType;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-brand/30 hover:shadow-[0_28px_60px_-40px_rgba(0,0,0,0.5)]",
        featured && "md:grid md:grid-cols-2",
        className,
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn("relative block overflow-hidden", featured ? "aspect-[16/11] md:h-full" : "aspect-[16/9]")}
        tabIndex={-1}
        aria-hidden
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <CoverArt seed={post.slug} className="size-full transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="default" className="border-white/10 bg-black/30 text-white backdrop-blur-md">
              {tag.name}
            </Badge>
          ))}
        </div>
      </Link>

      <div className={cn("flex flex-1 flex-col p-5", featured && "md:justify-center md:p-8")}>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <time dateTime={new Date(post.publishedAt ?? post.createdAt).toISOString()}>
            {formatDate(post.publishedAt ?? post.createdAt)}
          </time>
          <span className="size-1 rounded-full bg-border" />
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {post.readingTime} min
          </span>
        </div>

        <h3
          className={cn(
            "mt-3 font-semibold leading-snug tracking-tight",
            featured ? "text-2xl md:text-3xl" : "text-lg",
          )}
        >
          <Link href={`/blog/${post.slug}`} className="transition-colors group-hover:text-brand">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className={cn("mt-2 text-sm leading-relaxed text-muted-foreground", featured ? "line-clamp-3 md:text-[0.95rem]" : "line-clamp-2")}>
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70">
            Read article
            <ArrowUpRight className="size-3.5 text-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {post.views.toLocaleString()} views
          </span>
        </div>
      </div>
    </article>
  );
}
