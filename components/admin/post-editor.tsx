"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bold,
  Check,
  Code2,
  Eye,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  Loader2,
  Quote,
  Save,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createPostAction, updatePostAction } from "@/actions/posts";
import { slugify, readingTime, cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Markdown } from "@/components/blog/markdown";
import { CoverArt } from "@/components/shared/cover-art";

type MediaItem = { id: string; url: string; filename: string; altText: string | null };

type EditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  featured: boolean;
  seoTitle: string | null;
  seoDesc: string | null;
  publishedAt: string | null;
  tags: { id: string; name: string }[];
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const toolbar = [
  { icon: Bold, title: "Bold", before: "**", after: "**", placeholder: "bold text" },
  { icon: Italic, title: "Italic", before: "_", after: "_", placeholder: "italic text" },
  { icon: Heading2, title: "Heading 2", before: "\n## ", after: "\n", placeholder: "Heading" },
  { icon: Heading3, title: "Heading 3", before: "\n### ", after: "\n", placeholder: "Subheading" },
  { icon: Quote, title: "Quote", before: "\n> ", after: "\n", placeholder: "A useful thought" },
  { icon: List, title: "List", before: "\n- ", after: "\n", placeholder: "List item" },
  { icon: Code2, title: "Code block", before: "\n```ts\n", after: "\n```\n", placeholder: "const answer = 42;" },
  { icon: Link2, title: "Link", before: "[", after: "](https://)", placeholder: "link text" },
  { icon: ImageIcon, title: "Image", before: "![", after: "](/uploads/…)", placeholder: "alt text" },
];

export function PostEditor({
  post,
  media,
}: {
  post?: EditorPost;
  media: MediaItem[];
}) {
  const router = useRouter();
  const isEditing = Boolean(post);

  const [title, setTitle] = React.useState(post?.title ?? "");
  const [slug, setSlug] = React.useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(post));
  const [excerpt, setExcerpt] = React.useState(post?.excerpt ?? "");
  const [content, setContent] = React.useState(post?.content ?? "");
  const [coverImage, setCoverImage] = React.useState(post?.coverImage ?? "");
  const [status, setStatus] = React.useState(post?.status ?? "DRAFT");
  const [featured, setFeatured] = React.useState(post?.featured ?? false);
  const [seoTitle, setSeoTitle] = React.useState(post?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = React.useState(post?.seoDesc ?? "");
  const [publishedAt, setPublishedAt] = React.useState(toLocalInput(post?.publishedAt ?? null));
  const [tags, setTags] = React.useState<string[]>(post?.tags.map((tag) => tag.name) ?? []);
  const [tagInput, setTagInput] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [mediaOpen, setMediaOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"write" | "preview">("write");
  const [autosavedAt, setAutosavedAt] = React.useState<string | null>(null);
  const [storedDraft, setStoredDraft] = React.useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    tags: string[];
    featured: boolean;
    seoTitle: string;
    seoDesc: string;
    status: string;
    publishedAt: string;
    savedAt: string;
  } | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const storageKey = React.useMemo(() => `kd-draft-${post?.id ?? "new"}`, [post?.id]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.content) return;
      const differsFromSaved =
        !post ||
        parsed.content !== (post.content ?? "") ||
        parsed.title !== (post.title ?? "") ||
        parsed.excerpt !== (post.excerpt ?? "");
      if (differsFromSaved) {
        // The draft lives in localStorage, which is only available after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStoredDraft(parsed);
      }
    } catch {
      // ignore corrupt drafts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            title,
            slug,
            excerpt,
            content,
            coverImage,
            tags,
            featured,
            seoTitle,
            seoDesc,
            status,
            publishedAt,
            savedAt: new Date().toISOString(),
          }),
        );
        setAutosavedAt(
          new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()),
        );
      } catch {
        // storage full / private mode
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [storageKey, title, slug, excerpt, content, coverImage, tags, featured, seoTitle, seoDesc, status, publishedAt]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function addTag() {
    const next = tagInput.trim().replace(/^#/, "");
    if (!next || tags.length >= 8) return;
    if (!tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) {
      setTags((current) => [...current, next.slice(0, 40)]);
    }
    setTagInput("");
  }

  function insert(before: string, after = "", placeholder = "") {
    const element = textareaRef.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function restoreDraft() {
    if (!storedDraft) return;
    setTitle(storedDraft.title ?? "");
    setSlug(storedDraft.slug ?? "");
    setExcerpt(storedDraft.excerpt ?? "");
    setContent(storedDraft.content ?? "");
    setCoverImage(storedDraft.coverImage ?? "");
    setTags(storedDraft.tags ?? []);
    setFeatured(storedDraft.featured ?? false);
    setSeoTitle(storedDraft.seoTitle ?? "");
    setSeoDesc(storedDraft.seoDesc ?? "");
    setStatus(storedDraft.status ?? "DRAFT");
    setPublishedAt(storedDraft.publishedAt ?? "");
    setStoredDraft(null);
    toast.success("Local draft restored");
  }

  function discardDraft() {
    localStorage.removeItem(storageKey);
    setStoredDraft(null);
  }

  async function save(overrideStatus?: "DRAFT" | "PUBLISHED") {
    setErrors({});
    const nextStatus = overrideStatus ?? (status as "DRAFT" | "PUBLISHED" | "SCHEDULED");

    if (title.trim().length < 3) {
      setErrors({ title: "Give the post a title first." });
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setErrors({ slug: "Use lowercase letters, numbers and hyphens." });
      return;
    }
    if (content.trim().length < 20) {
      setErrors({ content: "A little more content, please (at least 20 characters)." });
      return;
    }
    if (nextStatus === "SCHEDULED" && !publishedAt) {
      setErrors({ publishedAt: "Pick a date and time for the schedule." });
      return;
    }

    const payload = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status: nextStatus,
      featured,
      tags,
      seoTitle,
      seoDesc,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : "",
    };

    setSaving(true);
    const result = isEditing
      ? await updatePostAction(post!.id, payload)
      : await createPostAction(payload);
    setSaving(false);

    if (result.error) {
      setErrors(result.fieldErrors ?? {});
      toast.error(result.error);
      return;
    }

    localStorage.removeItem(storageKey);
    setStatus(nextStatus);
    toast.success(
      nextStatus === "PUBLISHED"
        ? "Published — it's live."
        : nextStatus === "SCHEDULED"
          ? "Scheduled for later."
          : "Draft saved.",
    );
    router.push("/admin/blog");
    router.refresh();
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm" className="rounded-full">
            <Link href="/admin/blog" aria-label="Back to posts">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {isEditing ? "Edit post" : "New post"}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {autosavedAt ? `Autosaved locally at ${autosavedAt}` : "Changes autosave locally every few seconds"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] sm:inline-flex",
              status === "PUBLISHED"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : status === "SCHEDULED"
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border text-muted-foreground",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {status.toLowerCase()}
          </span>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-3.5" /> Preview
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => save("DRAFT")} disabled={saving}>
            Save draft
          </Button>
          <Button size="sm" className="rounded-full" onClick={() => save()} disabled={saving}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {saving ? "Saving…" : isEditing ? "Save changes" : "Create post"}
          </Button>
        </div>
      </div>

      {storedDraft && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-2.5 text-[11px]">
          <Sparkles className="size-3.5 text-amber-500" />
          <span className="flex-1">
            An unsaved local draft from {formatDateTime(storedDraft.savedAt)} was found.
          </span>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={restoreDraft}>
            Restore
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={discardDraft}>
            Discard
          </Button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <Label htmlFor="title" className="sr-only">
              Title
            </Label>
            <input
              id="title"
              value={title}
              onChange={(event) => updateTitle(event.target.value)}
              placeholder="A title worth clicking…"
              className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
            />
            {errors.title && <p className="mt-2 text-[11px] text-destructive">{errors.title}</p>}

            <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
              <span className="font-mono text-[10px] text-muted-foreground">/blog/</span>
              <input
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="post-slug"
                className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-foreground/80 outline-none placeholder:text-muted-foreground/40"
                aria-label="Slug"
              />
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(true);
                  setSlug(slugify(title));
                }}
                className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[9px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Generate
              </button>
            </div>
            {errors.slug && <p className="mt-1.5 text-[11px] text-destructive">{errors.slug}</p>}
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
              <div className="mr-2 flex rounded-full bg-muted p-0.5">
                <button
                  type="button"
                  onClick={() => setTab("write")}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-medium transition-colors",
                    tab === "write" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-medium transition-colors",
                    tab === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  Preview
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-0.5">
                {toolbar.map(({ icon: Icon, title: label, before, after, placeholder }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => insert(before, after, placeholder)}
                    title={label}
                    aria-label={label}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-3.5" />
                  </button>
                ))}
              </div>

              <span className="ml-auto hidden font-mono text-[9px] text-muted-foreground sm:block">
                {wordCount} words · {readingTime(content)} min
              </span>
            </div>

            {tab === "write" ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={"Write in Markdown. Start with a thought, then give it structure.\n\n## A heading\n\nSome paragraphs and maybe `inline code`."}
                className="min-h-[520px] w-full resize-y bg-transparent p-5 font-mono text-[12.5px] leading-[1.85] outline-none placeholder:text-muted-foreground/40"
                spellCheck
              />
            ) : (
              <div className="min-h-[520px] p-5">
                {content.trim() ? (
                  <Markdown content={content} />
                ) : (
                  <p className="text-xs text-muted-foreground">Nothing to preview yet.</p>
                )}
              </div>
            )}
            {errors.content && (
              <p className="border-t border-border px-5 py-2 text-[11px] text-destructive">{errors.content}</p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Publishing
            </p>
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]" htmlFor="publishedAt">
                  {status === "SCHEDULED" ? "Publish at" : "Published date"}
                </Label>
                <input
                  id="publishedAt"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background/60 px-2.5 text-[11px] text-foreground outline-none focus:ring-2 focus:ring-ring/50"
                />
                {errors.publishedAt && <p className="text-[10px] text-destructive">{errors.publishedAt}</p>}
                {status === "PUBLISHED" && !publishedAt && (
                  <p className="text-[10px] text-muted-foreground">Leave blank to publish now.</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Star className={cn("size-3.5", featured ? "fill-brand text-brand" : "text-muted-foreground")} />
                  Feature on blog
                </span>
                <Switch checked={featured} onCheckedChange={setFeatured} aria-label="Feature post" />
              </div>

              {post && (
                <p className="text-[10px] text-muted-foreground">
                  {post.status === "PUBLISHED" ? "Currently live." : "Not publicly visible yet."}
                </p>
              )}

              <Button className="w-full rounded-full" size="sm" onClick={() => save()} disabled={saving}>
                {status === "PUBLISHED" ? <Send className="size-3.5" /> : <Save className="size-3.5" />}
                {saving ? "Saving…" : status === "PUBLISHED" ? "Publish / update" : "Save post"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Cover image
            </p>
            <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-lg border border-border">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="" className="size-full object-cover" />
              ) : (
                <CoverArt seed={slug || title || "untitled"} className="size-full" />
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full text-[10px]"
                onClick={() => setMediaOpen(true)}
              >
                <ImageIcon className="size-3" /> Choose
              </Button>
              {coverImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[10px]"
                  onClick={() => setCoverImage("")}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
            <Input
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="https://… or /uploads/…"
              className="mt-2 h-8 text-[10px]"
              aria-label="Cover image URL"
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Excerpt
            </p>
            <Textarea
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="One or two sentences that make someone want to read on…"
              className="mt-2 min-h-20 text-xs"
              maxLength={300}
            />
            <p className="mt-1 text-right font-mono text-[9px] text-muted-foreground">{excerpt.length}/300</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Tags
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="brand" className="gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                    className="rounded-full p-0.5 hover:bg-brand/20"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
              {tags.length === 0 && <span className="text-[10px] text-muted-foreground">No tags yet</span>}
            </div>
            <Input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder="Add a tag, press Enter"
              className="mt-2 h-8 text-[11px]"
              disabled={tags.length >= 8}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              SEO
            </p>
            <div className="mt-3 space-y-2.5">
              <div className="space-y-1">
                <Label className="text-[10px]" htmlFor="seoTitle">
                  SEO title
                </Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                  placeholder={title || "Defaults to post title"}
                  maxLength={70}
                  className="h-8 text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]" htmlFor="seoDesc">
                  Meta description
                </Label>
                <Textarea
                  id="seoDesc"
                  value={seoDesc}
                  onChange={(event) => setSeoDesc(event.target.value)}
                  placeholder={excerpt || "150–160 characters works best"}
                  maxLength={180}
                  className="min-h-16 text-[11px]"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto p-0">
          <DialogHeader className="border-b border-border p-5">
            <DialogTitle className="pr-8">Preview</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="" className="mb-6 aspect-[21/9] w-full rounded-xl object-cover" />
            )}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="brand">{tag}</Badge>
              ))}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title || "Untitled post"}</h1>
            {excerpt && <p className="mt-2 text-sm text-muted-foreground">{excerpt}</p>}
            <div className="mt-6">
              <Markdown content={content || "_Nothing written yet._"} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a cover</DialogTitle>
          </DialogHeader>
          {media.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Your media library is empty.</p>
              <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
                <Link href="/admin/media">Upload images</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCoverImage(item.url);
                    setMediaOpen(false);
                  }}
                  className={cn(
                    "group relative aspect-[4/3] overflow-hidden rounded-lg border border-border transition-all hover:border-brand",
                    coverImage === item.url && "ring-2 ring-brand",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.altText ?? item.filename} className="size-full object-cover transition-transform group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 p-1 text-[8px] text-white">
                    {item.filename}
                  </span>
                  {coverImage === item.url && (
                    <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand text-brand-foreground">
                      <Check className="size-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
