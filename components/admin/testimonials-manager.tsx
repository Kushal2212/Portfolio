"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  MessageSquareQuote,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialsAction,
  setTestimonialPublishedAction,
  updateTestimonialAction,
} from "@/actions/testimonials";
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

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  published: boolean;
  order: number;
};

export function TestimonialsManager({
  testimonials,
  usingFallback,
}: {
  testimonials: Testimonial[];
  usingFallback: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<Testimonial | null>(null);
  const [published, setPublished] = React.useState(true);
  const [pendingDelete, setPendingDelete] = React.useState<Testimonial | null>(null);
  const [busy, setBusy] = React.useState(false);

  const publishedCount = testimonials.filter((item) => item.published).length;

  function openAdd() {
    setEditing(null);
    setPublished(true);
    setAdding(true);
  }

  function openEdit(testimonial: Testimonial) {
    setAdding(false);
    setEditing(testimonial);
    setPublished(testimonial.published);
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= testimonials.length) return;
    const next = [...testimonials];
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    const result = await reorderTestimonialsAction(next.map((item) => item.id));
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function create(formData: FormData) {
    setBusy(true);
    const result = await createTestimonialAction(formData);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Testimonial added");
    setAdding(false);
    router.refresh();
  }

  async function update(formData: FormData) {
    if (!editing) return;
    setBusy(true);
    const result = await updateTestimonialAction(editing.id, formData);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Testimonial updated");
    setEditing(null);
    router.refresh();
  }

  async function togglePublished(testimonial: Testimonial) {
    setBusy(true);
    const result = await setTestimonialPublishedAction(testimonial.id, !testimonial.published);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      testimonial.published ? "Hidden from the home page" : "Shown on the home page",
    );
    router.refresh();
  }

  async function remove() {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteTestimonialAction(pendingDelete.id);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Testimonial removed");
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">Testimonials</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Quotes shown on the home page. {publishedCount} of {testimonials.length} visible.
          </p>
        </div>
        <Button size="sm" className="rounded-full" onClick={openAdd}>
          <Plus className="size-3.5" /> Add testimonial
        </Button>
      </div>

      {usingFallback && (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-brand/40 bg-brand-strong/[0.06] p-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-strong/20 text-brand">
            <MessageSquareQuote className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium">The home page is showing the built-in examples</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              Add your first testimonial here and the three sample quotes will be replaced.
              Hidden entries stay in this list but never appear publicly.
            </p>
          </div>
        </div>
      )}

      {testimonials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <MessageSquareQuote className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No managed testimonials yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a quote from a colleague, client or collaborator.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <MessageSquareQuote className="size-4" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-xs font-medium">{testimonial.name}</p>
                  <Badge
                    variant={testimonial.published ? "success" : "outline"}
                    className="text-[9px]"
                  >
                    {testimonial.published ? "Live" : "Hidden"}
                  </Badge>
                </div>
                {testimonial.role && (
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {testimonial.role}
                  </p>
                )}
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-foreground/70">
                  “{testimonial.quote}”
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  onClick={() => togglePublished(testimonial)}
                  disabled={busy}
                  aria-label={testimonial.published ? "Hide testimonial" : "Show testimonial"}
                >
                  {testimonial.published ? (
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
                  disabled={index === testimonials.length - 1 || busy}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7"
                  onClick={() => openEdit(testimonial)}
                  aria-label="Edit testimonial"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(testimonial)}
                  aria-label="Delete testimonial"
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
            <DialogTitle>{editing ? "Edit testimonial" : "Add a testimonial"}</DialogTitle>
          </DialogHeader>
          <form key={editing?.id ?? "new"} action={editing ? update : create} className="space-y-4">
            <input type="hidden" name="published" value={published ? "true" : "false"} />
            <div className="space-y-1.5">
              <Label htmlFor="testimonial-quote">Quote</Label>
              <Textarea
                id="testimonial-quote"
                name="quote"
                defaultValue={editing?.quote ?? ""}
                placeholder="What did they say about working with you?"
                className="min-h-28"
                maxLength={600}
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Keep it short. Quotes work best at two or three sentences.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="testimonial-name">Name</Label>
                <Input
                  id="testimonial-name"
                  name="name"
                  defaultValue={editing?.name ?? ""}
                  placeholder="Maya Lindqvist"
                  maxLength={80}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="testimonial-role">Role or company</Label>
                <Input
                  id="testimonial-role"
                  name="role"
                  defaultValue={editing?.role ?? ""}
                  placeholder="Product lead, Fathom Labs"
                  maxLength={120}
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
                onClick={() => {
                  setAdding(false);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add testimonial"}
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
            <AlertDialogTitle>Remove this testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              The quote from {pendingDelete?.name} will disappear from the home page. This cannot be
              undone.
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
