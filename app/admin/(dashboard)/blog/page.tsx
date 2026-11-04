import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminPosts } from "@/lib/posts";
import { PageHeader } from "@/components/admin/stat-card";
import { PostsTable } from "@/components/admin/posts-table";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Blog posts" };
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAdminPosts();

  const tagNames = [...new Set(posts.flatMap((post) => post.tags.map((tag) => tag.name)))].sort(
    (a, b) => a.localeCompare(b),
  );
  const tags = tagNames.map((name) => ({ id: name, name }));

  const published = posts.filter((post) => post.status === "PUBLISHED").length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Blog posts"
        description={`${posts.length} posts · ${published} published · ${posts.length - published} drafts & scheduled`}
      >
        <Button asChild size="sm" className="rounded-full">
          <Link href="/admin/blog/new">
            <Plus className="size-3.5" /> New post
          </Link>
        </Button>
      </PageHeader>

      <PostsTable posts={posts} tags={tags} />
    </div>
  );
}
