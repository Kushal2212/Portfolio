"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckSquare,
  Clipboard,
  CloudUpload,
  FileImage,
  ImageIcon,
  Loader2,
  Play,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { deleteMediaAction, updateMediaAction } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/primitives";
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
import { cn, formatBytes, formatDate } from "@/lib/utils";

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  caption: string | null;
  published: boolean;
  size: number;
  mimeType: string;
  createdAt: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";

function isVideo(item: { mimeType: string }) {
  return item.mimeType.startsWith("video/");
}

export function MediaManager({
  media,
  cloudinaryEnabled,
}: {
  media: MediaItem[];
  cloudinaryEnabled: boolean;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string>("");
  const [uploadToGallery, setUploadToGallery] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [active, setActive] = React.useState<MediaItem | null>(null);
  const [altText, setAltText] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [published, setPublished] = React.useState(false);
  const [savingAlt, setSavingAlt] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<string[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function uploadVideoDirect(file: File) {
    const signResponse = await fetch("/api/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name }),
    });
    const sign = (await signResponse.json()) as {
      id?: string;
      uploadUrl?: string;
      fields?: Record<string, string>;
      error?: string;
    };
    if (!signResponse.ok || !sign.id || !sign.uploadUrl || !sign.fields) {
      throw new Error(sign.error || "Could not prepare the video upload.");
    }

    const body = new FormData();
    body.append("file", file);
    for (const [key, value] of Object.entries(sign.fields)) body.append(key, value);

    const uploadResponse = await fetch(sign.uploadUrl, { method: "POST", body });
    const uploaded = (await uploadResponse.json()) as {
      public_id?: string;
      bytes?: number;
      width?: number;
      height?: number;
      error?: { message?: string };
    };
    if (!uploadResponse.ok || !uploaded.public_id) {
      throw new Error(uploaded.error?.message || "Cloudinary rejected the video.");
    }

    const completeResponse = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sign.id,
        publicId: uploaded.public_id,
        bytes: uploaded.bytes,
        width: uploaded.width,
        height: uploaded.height,
        published: uploadToGallery,
      }),
    });
    const complete = (await completeResponse.json()) as { error?: string };
    if (!completeResponse.ok) {
      throw new Error(complete.error || "Could not save the video.");
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return media;
    return media.filter(
      (item) =>
        item.filename.toLowerCase().includes(q) ||
        (item.altText ?? "").toLowerCase().includes(q) ||
        (item.caption ?? "").toLowerCase().includes(q),
    );
  }, [media, query]);

  const allSelected = filtered.length > 0 && filtered.every((item) => selected.includes(item.id));

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    let success = 0;

    for (const file of list) {
      setUploadProgress(`Uploading ${file.name}…`);
      const video = file.type.startsWith("video/");
      const limit = video ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > limit) {
        toast.error(`${file.name} is larger than ${video ? "100 MB" : "5 MB"}`);
        continue;
      }
      if (video && cloudinaryEnabled) {
        try {
          await uploadVideoDirect(file);
          success += 1;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Could not upload ${file.name}`);
        }
        continue;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("published", String(uploadToGallery));
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || `Could not upload ${file.name}`);
        } else {
          success += 1;
        }
      } catch {
        toast.error(`Network error uploading ${file.name}`);
      }
    }

    setUploading(false);
    setUploadProgress("");
    if (success > 0) {
      toast.success(
        uploadToGallery
          ? `${success} ${success === 1 ? "file" : "files"} uploaded to the gallery`
          : `${success} ${success === 1 ? "file" : "files"} uploaded`,
      );
      router.refresh();
    }
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAll() {
    if (allSelected) {
      setSelected((current) => current.filter((id) => !filtered.some((item) => item.id === id)));
    } else {
      setSelected((current) => [...new Set([...current, ...filtered.map((item) => item.id)])]);
    }
  }

  async function copyUrl(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${item.url}`);
      setCopiedId(item.id);
      toast.success("URL copied");
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast.error("Could not copy the URL");
    }
  }

  async function saveAlt() {
    if (!active) return;
    setSavingAlt(true);
    const result = await updateMediaAction(active.id, { altText, caption, published });
    setSavingAlt(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(published ? "Saved and shown in the gallery" : "Media details saved");
    setActive(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete?.length) return;
    setBusy(true);
    const result = await deleteMediaAction(pendingDelete);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(pendingDelete.length > 1 ? "Assets deleted" : "Asset deleted");
    setSelected((current) => current.filter((id) => !pendingDelete.includes(id)));
    setPendingDelete(null);
    setActive(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          upload(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-brand bg-brand-strong/[0.06]" : "border-border bg-card/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) upload(event.target.files);
            event.target.value = "";
          }}
        />
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-strong/15 text-brand">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <CloudUpload className="size-5" />}
        </span>
        <p className="mt-3 text-sm font-medium">
          {uploading ? uploadProgress || "Uploading…" : "Drop images or videos here"}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          JPG, PNG, WebP, MP4, WebM or MOV · images up to 5 MB · videos up to 100 MB
        </p>
        <label className="mt-4 flex items-center gap-2.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-[11px]">
          <Switch
            checked={uploadToGallery}
            onCheckedChange={setUploadToGallery}
            aria-label="Publish uploads to the public gallery"
          />
          <span>Publish uploads to the public gallery</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 rounded-full"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <FileImage className="size-3.5" /> Choose files
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search filename or alt text…"
              className="h-9 pl-9 text-xs"
              aria-label="Search media"
            />
          </div>
          {selected.length > 0 && (
            <>
              <span className="text-[11px] text-muted-foreground">{selected.length} selected</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[11px] text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(selected)}
              >
                <Trash2 className="size-3" /> Delete
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-[11px]" onClick={() => setSelected([])}>
                Clear
              </Button>
            </>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ImageIcon className="size-5" />
            </span>
            <p className="mt-4 text-sm font-medium">
              {media.length === 0 ? "The library is empty" : "No media match that search"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {media.length === 0 ? "Drop a few files above to get started." : "Try a different term."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-brand/50",
                  selected.includes(item.id) && "ring-2 ring-brand",
                )}
              >
                <button
                  type="button"
                  data-media-thumb
                  onClick={() => {
                    setActive(item);
                    setAltText(item.altText ?? "");
                    setCaption(item.caption ?? "");
                    setPublished(item.published);
                  }}
                  className="block aspect-[4/3] w-full"
                  aria-label={`Open ${item.filename}`}
                >
                  {isVideo(item) ? (
                    <div className="relative size-full bg-black">
                      <video
                        src={`${item.url}#t=0.1`}
                        muted
                        playsInline
                        preload="metadata"
                        aria-hidden="true"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
                        <Play className="size-2 fill-current" /> Video
                      </span>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.url}
                      alt={item.altText ?? item.filename}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "absolute left-2 top-2 flex size-5 items-center justify-center rounded-md border backdrop-blur transition-colors",
                    selected.includes(item.id)
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-white/40 bg-black/25 text-white opacity-0 group-hover:opacity-100",
                  )}
                  aria-label={`Select ${item.filename}`}
                >
                  {selected.includes(item.id) ? <Check className="size-3" /> : <Square className="size-2.5" />}
                </button>

                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => copyUrl(item)}
                    className="flex size-6 items-center justify-center rounded-md bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
                    aria-label="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="size-3" /> : <Clipboard className="size-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete([item.id])}
                    className="flex size-6 items-center justify-center rounded-md bg-black/40 text-white backdrop-blur transition-colors hover:bg-destructive"
                    aria-label="Delete media"
                  >
                    <X className="size-3" />
                  </button>
                </div>

                <div className="border-t border-border bg-card p-2">
                  <p className="truncate text-[10px] font-medium">{item.filename}</p>
                  <p className="mt-0.5 flex items-center justify-between text-[9px] text-muted-foreground">
                    <span>{formatBytes(item.size)}</span>
                    {item.published ? (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <span className="size-1 rounded-full bg-brand" /> gallery
                      </span>
                    ) : (
                      <span>{formatDate(item.createdAt)}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
          <button onClick={toggleAll} className="inline-flex items-center gap-1.5 hover:text-foreground">
            {allSelected ? <CheckSquare className="size-3" /> : <Square className="size-3" />}
            Select all
          </button>
          <span>
            {filtered.length} of {media.length} assets
          </span>
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate pr-6 text-sm">{active?.filename}</DialogTitle>
          </DialogHeader>
          {active && (
            <>
              <div className="overflow-hidden rounded-lg border border-border bg-muted">
                {isVideo(active) ? (
                  <video
                    key={active.id}
                    src={active.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-[320px] w-full bg-black object-contain"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={active.url}
                    alt={active.altText ?? active.filename}
                    className="max-h-[320px] w-full object-contain"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                <Badge variant="outline">{active.mimeType.split("/")[1]?.toUpperCase()}</Badge>
                <span>{formatBytes(active.size)}</span>
                <span>·</span>
                <span>Uploaded {formatDate(active.createdAt)}</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alt" className="text-[11px]">
                  Alt text
                </Label>
                <Input
                  id="alt"
                  value={altText}
                  onChange={(event) => setAltText(event.target.value)}
                  placeholder="Describe the image or video for screen readers"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="caption" className="text-[11px]">
                  Gallery caption
                </Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="A place, a moment, a few words"
                  className="h-9 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  Optional. Appears under the item on the public gallery.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <div>
                  <Label htmlFor="published" className="text-[11px]">
                    Show in gallery
                  </Label>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Published media appear on /photos within a minute.
                  </p>
                </div>
                <Switch id="published" checked={published} onCheckedChange={setPublished} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="rounded-full" onClick={saveAlt} disabled={savingAlt}>
                  {savingAlt ? "Saving…" : "Save details"}
                </Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => copyUrl(active)}>
                  <Clipboard className="size-3.5" /> Copy URL
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto rounded-full text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete([active.id])}
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete?.length === 1 ? "this asset" : `${pendingDelete?.length} assets`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Files are removed from the server and any blog post using them will lose its cover.
              This cannot be undone.
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
