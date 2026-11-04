"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  CheckSquare,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Square,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { PostCard } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deletePostsAction,
  setPostsStatusAction,
} from "@/actions/posts";
import { cn, formatDate } from "@/lib/utils";

type AdminPost = PostCard & {
  status: string;
  updatedAt: Date | string;
  seoDesc: string | null;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED") return <Badge variant="success">Published</Badge>;
  if (status === "SCHEDULED") return <Badge variant="warning">Scheduled</Badge>;
  return <Badge variant="default">Draft</Badge>;
}

export function PostsTable({
  posts,
  tags,
}: {
  posts: AdminPost[];
  tags: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [tag, setTag] = React.useState("ALL");
  const [sort, setSort] = React.useState("updated");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = React.useState<string[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = posts.filter((post) => {
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.tags.some((t) => t.name.toLowerCase().includes(q));
      const matchesStatus = status === "ALL" || post.status === status;
      const matchesTag = tag === "ALL" || post.tags.some((t) => t.id === tag);
      return matchesQuery && matchesStatus && matchesTag;
    });

    return list.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "views") return b.views - a.views;
      if (sort === "published") {
        return new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [posts, query, status, tag, sort]);

  const allSelected = filtered.length > 0 && filtered.every((post) => selected.includes(post.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((current) => current.filter((id) => !filtered.some((post) => post.id === id)));
    } else {
      setSelected((current) => [...new Set([...current, ...filtered.map((post) => post.id)])]);
    }
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function bulkStatus(next: "PUBLISHED" | "DRAFT") {
    if (!selected.length) return;
    setBusy(true);
    const result = await setPostsStatusAction(selected, next);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(next === "PUBLISHED" ? "Posts published" : "Posts moved to draft");
    setSelected([]);
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete?.length) return;
    setBusy(true);
    const result = await deletePostsAction(pendingDelete);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(pendingDelete.length > 1 ? "Posts deleted" : "Post deleted");
    setSelected((current) => current.filter((id) => !pendingDelete.includes(id)));
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, slug or tag…"
            className="h-9 pl-9 text-xs"
            aria-label="Search posts"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[136px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="h-9 w-[126px] text-xs">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All tags</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-[142px] text-xs">
              <ArrowUpDown className="size-3" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last updated</SelectItem>
              <SelectItem value="published">Published date</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
              <SelectItem value="views">Most viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-brand-strong/[0.06] px-4 py-2.5">
          <span className="text-[11px] font-medium text-brand">{selected.length} selected</span>
          <span className="h-3 w-px bg-border" />
          <Button variant="ghost" size="sm" className="h-7 text-[11px]" disabled={busy} onClick={() => bulkStatus("PUBLISHED")}>
            Publish
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-[11px]" disabled={busy} onClick={() => bulkStatus("DRAFT")}>
            Unpublish
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-destructive hover:text-destructive"
            disabled={busy}
            onClick={() => setPendingDelete(selected)}
          >
            <Trash2 className="size-3" /> Delete
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-[10px]" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileText className="size-5" />
          </span>
          <p className="mt-4 text-sm font-medium">
            {posts.length === 0 ? "No posts yet" : "No posts match those filters"}
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {posts.length === 0
              ? "Write the first one — start with a title and a rough thought."
              : "Try a different search, status or tag."}
          </p>
          {posts.length === 0 ? (
            <Button asChild size="sm" className="mt-5 rounded-full">
              <Link href="/admin/blog/new">
                <Plus className="size-3.5" /> New post
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="mt-5 rounded-full"
              onClick={() => {
                setQuery("");
                setStatus("ALL");
                setTag("ALL");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-0 text-sm md:min-w-[760px]">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="w-10 px-4 py-2.5">
                  <button onClick={toggleAll} aria-label="Select all" className="text-muted-foreground hover:text-foreground">
                    {allSelected ? <CheckSquare className="size-3.5" /> : <Square className="size-3.5" />}
                  </button>
                </th>
                <th className="px-2 py-2.5 font-semibold">Title</th>
                <th className="px-2 py-2.5 font-semibold">Status</th>
                <th className="hidden px-2 py-2.5 font-semibold md:table-cell">Tags</th>
                <th className="hidden px-2 py-2.5 font-semibold md:table-cell">Published</th>
                <th className="hidden px-2 py-2.5 font-semibold md:table-cell">Views</th>
                <th className="w-12 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  className={cn(
                    "border-b border-border/70 transition-colors last:border-0 hover:bg-muted/30",
                    selected.includes(post.id) && "bg-brand-strong/[0.05]",
                  )}
                >
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(post.id)} aria-label={`Select ${post.title}`} className="text-muted-foreground hover:text-foreground">
                      {selected.includes(post.id) ? (
                        <CheckSquare className="size-3.5 text-brand" />
                      ) : (
                        <Square className="size-3.5" />
                      )}
                    </button>
                  </td>
                  <td className="px-2 py-3">
                    <Link href={`/admin/blog/${post.id}/edit`} className="group block max-w-[180px] sm:max-w-[260px] lg:max-w-[320px]">
                      <span className="block truncate text-[13px] font-medium group-hover:text-brand">
                        {post.featured && <span className="mr-1.5 text-brand">★</span>}
                        {post.title}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[9px] text-muted-foreground">
                        /{post.slug}
                      </span>
                    </Link>
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="hidden px-2 py-3 md:table-cell">
                    <div className="flex max-w-[160px] flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((t) => (
                        <span key={t.id} className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                          {t.name}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="text-[9px] text-muted-foreground">+{post.tags.length - 2}</span>
                      )}
                      {post.tags.length === 0 && <span className="text-[10px] text-muted-foreground/60">—</span>}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-3 text-[11px] text-muted-foreground md:table-cell">
                    {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                  </td>
                  <td className="hidden px-2 py-3 font-mono text-[10px] text-muted-foreground md:table-cell">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="size-7" aria-label="Post actions">
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/blog/${post.id}/edit`}>
                            <Pencil /> Edit
                          </Link>
                        </DropdownMenuItem>
                        {post.status === "PUBLISHED" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Eye /> View live
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setPendingDelete([post.id])}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
        <span>
          {filtered.length} of {posts.length} posts
        </span>
        <span className="font-mono">Sorted by {sort}</span>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete?.length === 1 ? "this post" : `${pendingDelete?.length} posts`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the content and its tags association. Published URLs will
              return a 404. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={busy}>
              {busy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
