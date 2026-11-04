"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Disc3,
  ExternalLink,
  Eye,
  EyeOff,
  Music2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTrackAction,
  deleteTrackAction,
  reorderTracksAction,
  setTrackPublishedAction,
  updateTrackAction,
} from "@/actions/music";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
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

type Track = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  year: number | null;
  coverUrl: string | null;
  link: string | null;
  note: string | null;
  published: boolean;
  order: number;
};

export function MusicManager({ tracks }: { tracks: Track[] }) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<Track | null>(null);
  const [published, setPublished] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Track | null>(null);
  const [busy, setBusy] = React.useState(false);

  const publishedCount = tracks.filter((track) => track.published).length;

  function openAdd() {
    setEditing(null);
    setPublished(true);
    setAdding(true);
  }

  function openEdit(track: Track) {
    setAdding(false);
    setEditing(track);
    setPublished(track.published);
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= tracks.length) return;
    const next = [...tracks];
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    const result = await reorderTracksAction(next.map((track) => track.id));
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function create(formData: FormData) {
    setBusy(true);
    const result = await createTrackAction(formData);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Track added");
    setAdding(false);
    router.refresh();
  }

  async function update(formData: FormData) {
    if (!editing) return;
    setBusy(true);
    const result = await updateTrackAction(editing.id, formData);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Track updated");
    setEditing(null);
    router.refresh();
  }

  async function togglePublished(track: Track) {
    setBusy(true);
    const result = await setTrackPublishedAction(track.id, !track.published);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(track.published ? "Hidden from the music page" : "Shown on the music page");
    router.refresh();
  }

  async function remove() {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteTrackAction(pendingDelete.id);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Track removed");
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">Music</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Tracks and albums on the public listening page. {publishedCount} of {tracks.length}{" "}
            visible.
          </p>
        </div>
        <Button size="sm" className="rounded-full" onClick={openAdd}>
          <Plus className="size-3.5" /> Add track
        </Button>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Disc3 className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No music yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a track, album or playlist you want to share.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                {track.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.coverUrl}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground">
                    <Music2 className="size-4" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-xs font-medium">{track.title}</p>
                  <Badge variant={track.published ? "success" : "outline"} className="text-[9px]">
                    {track.published ? "Live" : "Hidden"}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  {track.artist}
                  {track.album ? ` · ${track.album}` : ""}
                  {track.year ? ` · ${track.year}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                {track.link && (
                  <Button asChild variant="ghost" size="icon-sm" className="size-7">
                    <a
                      href={track.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${track.title}`}
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  onClick={() => togglePublished(track)}
                  disabled={busy}
                  aria-label={track.published ? "Hide track" : "Show track"}
                >
                  {track.published ? (
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
                  disabled={index === tracks.length - 1 || busy}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  onClick={() => openEdit(track)}
                  aria-label="Edit track"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(track)}
                  aria-label="Delete track"
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
          if (!open) {
            setAdding(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit track" : "Add a track"}</DialogTitle>
          </DialogHeader>
          <form
            key={editing?.id ?? "new"}
            action={editing ? update : create}
            className="space-y-4"
          >
            <input type="hidden" name="published" value={published ? "true" : "false"} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="track-title">Title</Label>
                <Input
                  id="track-title"
                  name="title"
                  defaultValue={editing?.title ?? ""}
                  placeholder="Track or album name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="track-artist">Artist</Label>
                <Input
                  id="track-artist"
                  name="artist"
                  defaultValue={editing?.artist ?? ""}
                  placeholder="Artist"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="track-year">Year</Label>
                <Input
                  id="track-year"
                  name="year"
                  type="number"
                  min={1900}
                  max={2100}
                  defaultValue={editing?.year ?? ""}
                  placeholder="2025"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="track-album">Album</Label>
                <Input
                  id="track-album"
                  name="album"
                  defaultValue={editing?.album ?? ""}
                  placeholder="Optional album or EP"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="track-cover">Cover image URL</Label>
                <Input
                  id="track-cover"
                  name="coverUrl"
                  defaultValue={editing?.coverUrl ?? ""}
                  placeholder="https://… or /uploads/…"
                />
                <p className="text-[10px] text-muted-foreground">
                  Optional. Upload artwork under Photos &amp; media, then paste its URL here.
                </p>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="track-link">Listen link</Label>
                <Input
                  id="track-link"
                  name="link"
                  defaultValue={editing?.link ?? ""}
                  placeholder="https://open.spotify.com/…"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="track-note">Note</Label>
                <Textarea
                  id="track-note"
                  name="note"
                  defaultValue={editing?.note ?? ""}
                  placeholder="A line about why it is here…"
                  className="min-h-20"
                  maxLength={300}
                />
              </div>
            </div>

            <label className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2.5">
              <span className="text-xs font-medium">Show on the music page</span>
              <Switch checked={published} onCheckedChange={setPublished} aria-label="Show on the music page" />
            </label>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setAdding(false);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add track"}
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
            <AlertDialogTitle>Remove this track?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” will be deleted from your music list. This cannot be undone.
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
