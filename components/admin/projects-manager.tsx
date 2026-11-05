"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  Github,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createProjectAction,
  deleteProjectAction,
  reorderProjectsAction,
  setProjectPublishedAction,
  updateProjectAction,
} from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { CoverArt } from "@/components/shared/cover-art";
import { slugify } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  slug: string;
  year: string;
  summary: string;
  tags: string[];
  coverImage: string | null;
  href: string | null;
  repo: string | null;
  metric: string | null;
  metricLabel: string | null;
  status: string;
  published: boolean;
  order: number;
};

const statuses = ["Live", "Open source", "Case study"] as const;

export function ProjectsManager({
  projects,
  usingFallback,
}: {
  projects: Project[];
  usingFallback: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<Project | null>(null);
  const [published, setPublished] = React.useState(true);
  const [status, setStatus] = React.useState<string>("Live");
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [coverImage, setCoverImage] = React.useState("");
  const [uploadingCover, setUploadingCover] = React.useState(false);
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Project | null>(null);
  const [busy, setBusy] = React.useState(false);

  const publishedCount = projects.filter((project) => project.published).length;

  function resetForm() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setCoverImage("");
    setStatus("Live");
  }

  function openAdd() {
    setEditing(null);
    resetForm();
    setPublished(true);
    setAdding(true);
  }

  function openEdit(project: Project) {
    setAdding(false);
    setEditing(project);
    setName(project.name);
    setSlug(project.slug);
    setSlugTouched(true);
    setCoverImage(project.coverImage ?? "");
    setStatus(project.status);
    setPublished(project.published);
  }

  function closeDialog() {
    setAdding(false);
    setEditing(null);
  }

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function uploadCover(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Images must be 4 MB or smaller.");
      return;
    }

    setUploadingCover(true);
    const form = new FormData();
    form.append("file", file);
    form.append("published", "false");

    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Could not upload the photo.");
        return;
      }
      setCoverImage(data.media?.url ?? "");
      toast.success("Photo uploaded");
    } catch {
      toast.error("Network error while uploading the photo.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    const result = await reorderProjectsAction(next.map((project) => project.id));
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function create(formData: FormData) {
    setBusy(true);
    const result = await createProjectAction(formData);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Project added");
    closeDialog();
    resetForm();
    router.refresh();
  }

  async function update(formData: FormData) {
    if (!editing) return;
    setBusy(true);
    const result = await updateProjectAction(editing.id, formData);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Project updated");
    closeDialog();
    resetForm();
    router.refresh();
  }

  async function togglePublished(project: Project) {
    setBusy(true);
    const result = await setProjectPublishedAction(project.id, !project.published);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(project.published ? "Hidden from the home page" : "Shown on the home page");
    router.refresh();
  }

  async function remove() {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteProjectAction(pendingDelete.id);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Project removed");
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">Projects</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Selected work shown on the home page. {publishedCount} of {projects.length} visible.
          </p>
        </div>
        <Button size="sm" className="rounded-full" onClick={openAdd}>
          <Plus className="size-3.5" /> Add project
        </Button>
      </div>

      {usingFallback && (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-brand/40 bg-brand-strong/[0.06] p-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-strong/20 text-brand">
            <FolderKanban className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium">The home page is showing the built-in examples</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              Add your first project here and the three sample cards will be replaced. Hidden
              entries stay in this list but never appear publicly.
            </p>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FolderKanban className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No managed projects yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a product, tool or side project you want to show.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                {project.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.coverImage} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <FolderKanban className="size-4" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-xs font-medium">{project.name}</p>
                  <Badge
                    variant={project.published ? "success" : "outline"}
                    className="text-[9px]"
                  >
                    {project.published ? "Live" : "Hidden"}
                  </Badge>
                  {project.status !== "Live" && (
                    <span className="text-[9px] text-muted-foreground">{project.status}</span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  {project.year} · /{project.slug}
                  {project.tags.length > 0 ? ` · ${project.tags.join(", ")}` : ""}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-foreground/70">
                  {project.summary}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                {project.href && (
                  <Button asChild variant="ghost" size="icon-sm" className="size-7">
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${project.name}`}
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </Button>
                )}
                {project.repo && (
                  <Button asChild variant="ghost" size="icon-sm" className="size-7">
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.name} repository`}
                    >
                      <Github className="size-3" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  onClick={() => togglePublished(project)}
                  disabled={busy}
                  aria-label={project.published ? "Hide project" : "Show project"}
                >
                  {project.published ? (
                    <Eye className="size-3" />
                  ) : (
                    <EyeOff className="size-3 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || busy}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  onClick={() => move(index, 1)}
                  disabled={index === projects.length - 1 || busy}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  onClick={() => openEdit(project)}
                  aria-label="Edit project"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(project)}
                  aria-label="Delete project"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={adding || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "Add a project"}</DialogTitle>
          </DialogHeader>
          <form
            key={editing?.id ?? "new"}
            action={editing ? update : create}
            className="space-y-4"
          >
            <input type="hidden" name="published" value={published ? "true" : "false"} />
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="coverImage" value={coverImage} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  name="name"
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="Orbit Analytics"
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-slug">Slug</Label>
                <Input
                  id="project-slug"
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlug(slugify(event.target.value));
                    setSlugTouched(true);
                  }}
                  placeholder="orbit-analytics"
                  maxLength={100}
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Used for the project card and cover art.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="project-year">Year</Label>
                <Input
                  id="project-year"
                  name="year"
                  defaultValue={editing?.year ?? ""}
                  placeholder="2025"
                  maxLength={12}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="project-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-summary">Summary</Label>
              <Textarea
                id="project-summary"
                name="summary"
                defaultValue={editing?.summary ?? ""}
                placeholder="A short sentence about what it does and why it exists."
                className="min-h-24"
                maxLength={300}
                required
              />
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-background/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium">Cover photo</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    JPG, PNG or WebP up to 4 MB. A generated cover is used when this is empty.
                  </p>
                </div>
                {coverImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-full px-2 text-[10px]"
                    onClick={() => setCoverImage("")}
                  >
                    <X className="size-3" /> Remove
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <div className="relative aspect-[16/10] w-40 shrink-0 overflow-hidden rounded-lg border border-border">
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverImage} alt="" className="size-full object-cover" />
                  ) : (
                    <CoverArt seed={slug || name || "project"} className="size-full" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadCover(file);
                      event.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit rounded-full text-[11px]"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                  >
                    {uploadingCover ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="size-3.5" />
                    )}
                    {uploadingCover ? "Uploading…" : coverImage ? "Replace photo" : "Upload photo"}
                  </Button>
                  <Input
                    value={coverImage}
                    onChange={(event) => setCoverImage(event.target.value)}
                    placeholder="https://… or /uploads/…"
                    className="h-8 text-[10px]"
                    aria-label="Project cover image URL"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-tags">Tags</Label>
              <Input
                id="project-tags"
                name="tags"
                defaultValue={editing?.tags.join(", ") ?? ""}
                placeholder="Next.js, Postgres, tRPC"
                maxLength={240}
              />
              <p className="text-[10px] text-muted-foreground">
                Comma separated. Up to 8 tags are kept.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="project-href">Live link</Label>
                <Input
                  id="project-href"
                  name="href"
                  defaultValue={editing?.href ?? ""}
                  placeholder="https://example.com"
                  maxLength={500}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-repo">Repository</Label>
                <Input
                  id="project-repo"
                  name="repo"
                  defaultValue={editing?.repo ?? ""}
                  placeholder="https://github.com/you/project"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="project-metric">Highlight number</Label>
                <Input
                  id="project-metric"
                  name="metric"
                  defaultValue={editing?.metric ?? ""}
                  placeholder="3"
                  maxLength={24}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-metric-label">Highlight label</Label>
                <Input
                  id="project-metric-label"
                  name="metricLabel"
                  defaultValue={editing?.metricLabel ?? ""}
                  placeholder="sites using it"
                  maxLength={48}
                />
              </div>
            </div>

            <label className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2.5">
              <span className="text-xs font-medium">Show on the home page</span>
              <Switch
                checked={published}
                onCheckedChange={setPublished}
                aria-label="Show on the home page"
              />
            </label>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this project?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} will disappear from the home page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
