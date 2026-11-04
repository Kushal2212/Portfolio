"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Camera,
  Code2,
  Coffee,
  Gamepad2,
  Github,
  Goal,
  Mountain,
  Music,
  Palette,
  Pencil,
  Plane,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  createInterestAction,
  deleteInterestAction,
  reorderInterestsAction,
  updateInterestAction,
} from "@/actions/interests";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Interest = { id: string; title: string; description: string; icon: string | null; order: number };

const iconMap: Record<string, LucideIcon> = {
  camera: Camera,
  mountain: Mountain,
  coffee: Coffee,
  book: BookOpen,
  github: Github,
  music: Music,
  palette: Palette,
  plane: Plane,
  gamepad: Gamepad2,
  code: Code2,
  trophy: Trophy,
  goal: Goal,
};

const iconOptions = Object.keys(iconMap);

export function InterestsManager({ interests }: { interests: Interest[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Interest | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [icon, setIcon] = React.useState("sparkles");
  const [pendingDelete, setPendingDelete] = React.useState<Interest | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function move(index: number, direction: -1 | 1) {
    const next = [...interests];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    const result = await reorderInterestsAction(next.map((item) => item.id));
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function create(formData: FormData) {
    setBusy(true);
    const result = await createInterestAction(formData);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Interest added");
    setAdding(false);
    router.refresh();
  }

  async function update(formData: FormData) {
    if (!editing) return;
    setBusy(true);
    const result = await updateInterestAction(editing.id, formData);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Interest updated");
    setEditing(null);
    router.refresh();
  }

  async function remove() {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteInterestAction(pendingDelete.id);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Interest removed");
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">Interests</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Shown as a bento grid on the public interests page. {interests.length} entries.
          </p>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => setAdding(true)}>
          <Plus className="size-3.5" /> Add interest
        </Button>
      </div>

      {interests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Sparkles className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No interests yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add a few things that keep you curious.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {interests.map((interest, index) => {
            const Icon = iconMap[interest.icon ?? ""] ?? Sparkles;
            return (
              <div
                key={interest.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{interest.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{interest.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
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
                    disabled={index === interests.length - 1 || busy}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7"
                    onClick={() => {
                      setEditing(interest);
                      setIcon(interest.icon ?? "sparkles");
                    }}
                    aria-label="Edit interest"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(interest)}
                    aria-label="Delete interest"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={adding || !!editing}
        onOpenChange={(open) => {
          if (!open) {
            setAdding(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit interest" : "Add an interest"}</DialogTitle>
          </DialogHeader>
          <form action={editing ? update : create} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="interest-title">Title</Label>
              <Input id="interest-title" name="title" defaultValue={editing?.title ?? ""} required placeholder="Photography" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interest-description">Description</Label>
              <Textarea
                id="interest-description"
                name="description"
                defaultValue={editing?.description ?? ""}
                required
                placeholder="A sentence or two about why it matters…"
                className="min-h-24"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interest-icon">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger id="interest-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((name) => {
                    const Icon = iconMap[name];
                    return (
                      <SelectItem key={name} value={name}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5" /> {name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <input type="hidden" name="icon" value={icon} />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setAdding(false);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add interest"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove “{pendingDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              It will disappear from the interests page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={busy}>
              {busy ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
