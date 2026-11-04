"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCheck,
  CheckSquare,
  Clock,
  Mail,
  MailOpen,
  Reply,
  Search,
  Square,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  bulkMessageStatusAction,
  deleteMessagesAction,
  updateMessageStatusAction,
} from "@/actions/messages";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  phone: string | null;
  body: string;
  status: string;
  createdAt: string;
};

const filters = [
  { value: "ALL", label: "All" },
  { value: "UNREAD", label: "Unread" },
  { value: "READ", label: "Read" },
  { value: "REPLIED", label: "Replied" },
  { value: "ARCHIVED", label: "Archived" },
];

function statusBadge(status: string) {
  if (status === "UNREAD") return <Badge variant="brand">Unread</Badge>;
  if (status === "REPLIED") return <Badge variant="success">Replied</Badge>;
  if (status === "ARCHIVED") return <Badge variant="outline">Archived</Badge>;
  return <Badge variant="default">Read</Badge>;
}

export function MessagesInbox({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const detailRef = React.useRef<HTMLDivElement>(null);
  const autoRead = React.useRef<Set<string>>(new Set());

  const [filter, setFilter] = React.useState("ALL");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(messages[0]?.id ?? null);
  const [checked, setChecked] = React.useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = React.useState<string[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  const selected = messages.find((message) => message.id === selectedId) ?? null;

  const counts = React.useMemo(() => {
    const base: Record<string, number> = { ALL: messages.length };
    for (const message of messages) base[message.status] = (base[message.status] ?? 0) + 1;
    return base;
  }, [messages]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return messages.filter((message) => {
      const matchesFilter = filter === "ALL" || message.status === filter;
      const matchesQuery =
        !q ||
        message.name.toLowerCase().includes(q) ||
        message.email.toLowerCase().includes(q) ||
        (message.subject ?? "").toLowerCase().includes(q) ||
        message.body.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [messages, filter, query]);

  React.useEffect(() => {
    if (!selected || selected.status !== "UNREAD" || autoRead.current.has(selected.id)) return;
    autoRead.current.add(selected.id);
    updateMessageStatusAction(selected.id, "READ").then(() => router.refresh());
  }, [selected, router]);

  function openMessage(message: Message) {
    setSelectedId(message.id);
    if (window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }

  async function setStatus(status: "READ" | "UNREAD" | "ARCHIVED" | "REPLIED") {
    if (!selected) return;
    setBusy(true);
    const result = await updateMessageStatusAction(selected.id, status);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Marked as ${status.toLowerCase()}`);
    router.refresh();
  }

  async function bulk(status: "READ" | "ARCHIVED") {
    if (!checked.length) return;
    setBusy(true);
    const result = await bulkMessageStatusAction(checked, status);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${checked.length} message${checked.length > 1 ? "s" : ""} updated`);
    setChecked([]);
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete?.length) return;
    setBusy(true);
    const result = await deleteMessagesAction(pendingDelete);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Message deleted");
    if (selectedId && pendingDelete.includes(selectedId)) setSelectedId(null);
    setChecked((current) => current.filter((id) => !pendingDelete.includes(id)));
    setPendingDelete(null);
    router.refresh();
  }

  function toggleChecked(id: string) {
    setChecked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* List */}
        <div className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-border p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search messages…"
                className="h-9 pl-9 text-xs"
                aria-label="Search messages"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                    filter === item.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                  <span className="ml-1 opacity-60">{counts[item.value] ?? 0}</span>
                </button>
              ))}
            </div>

            {checked.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5">
                <span className="text-[10px] font-medium">{checked.length} selected</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => bulk("READ")} disabled={busy}>
                  <CheckCheck className="size-3" /> Read
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => bulk("ARCHIVED")} disabled={busy}>
                  <Archive className="size-3" /> Archive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(checked)}
                  disabled={busy}
                >
                  <Trash2 className="size-3" />
                </Button>
                <button onClick={() => setChecked([])} className="ml-auto text-[10px] text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="max-h-[560px] overflow-y-auto lg:max-h-[calc(100vh-260px)]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Mail className="size-4" />
                </span>
                <p className="mt-3 text-sm font-medium">
                  {messages.length === 0 ? "The inbox is empty" : "Nothing matches"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {messages.length === 0
                    ? "Enquiries from the contact form will land here."
                    : "Try a different filter or search term."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((message) => (
                  <li key={message.id}>
                    <div
                      className={cn(
                        "group relative flex cursor-pointer gap-2.5 px-4 py-3 transition-colors hover:bg-muted/40",
                        selectedId === message.id && "bg-muted/60",
                        message.status === "UNREAD" && "bg-brand-strong/[0.04]",
                      )}
                      onClick={() => openMessage(message)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") openMessage(message);
                      }}
                    >
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleChecked(message.id);
                        }}
                        className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Select message from ${message.name}`}
                      >
                        {checked.includes(message.id) ? (
                          <CheckSquare className="size-3.5 text-brand" />
                        ) : (
                          <Square className="size-3.5" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("truncate text-xs", message.status === "UNREAD" ? "font-semibold" : "font-medium")}>
                            {message.status === "UNREAD" && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-brand align-middle" />}
                            {message.name}
                          </p>
                          <span className="shrink-0 text-[9px] text-muted-foreground">{timeAgo(message.createdAt)}</span>
                        </div>
                        <p className={cn("mt-0.5 truncate text-[11px]", message.status === "UNREAD" ? "text-foreground/80" : "text-muted-foreground")}>
                          {message.subject || "General enquiry"}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
                          {message.body}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
            {filtered.length} of {messages.length} messages
          </div>
        </div>

        {/* Detail */}
        <div ref={detailRef} className="min-h-[420px]">
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center px-8 py-20 text-center">
              <span className="flex size-14 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                <MailOpen className="size-5" />
              </span>
              <p className="mt-4 font-serif text-xl italic">Select a message</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Pick a conversation on the left to read it in full and reply.
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="border-b border-border p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {statusBadge(selected.status)}
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="size-3" /> {formatDateTime(selected.createdAt)}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-full px-2 text-[10px]"
                      onClick={() => setStatus(selected.status === "READ" ? "UNREAD" : "READ")}
                      disabled={busy}
                    >
                      <MailOpen className="size-3" />
                      {selected.status === "READ" ? "Mark unread" : "Mark read"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-full px-2 text-[10px]"
                      onClick={() => setStatus("ARCHIVED")}
                      disabled={busy}
                    >
                      <Archive className="size-3" /> Archive
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete([selected.id])}
                      aria-label="Delete message"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <h2 className="mt-3 text-lg font-semibold tracking-tight">
                  {selected.subject || "General enquiry"}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-strong/30 to-violet-500/20 text-[10px] font-semibold">
                    {selected.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-xs font-medium">{selected.name}</p>
                    <a href={`mailto:${selected.email}`} className="text-[10px] text-muted-foreground hover:text-brand">
                      {selected.email}
                    </a>
                  </div>
                  {selected.phone && (
                    <Badge variant="outline" className="ml-auto">
                      {selected.phone}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex-1 p-5">
                <p className="whitespace-pre-wrap text-[13px] leading-[1.8] text-foreground/85">
                  {selected.body}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
                <Button
                  asChild
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (selected.status !== "REPLIED") setStatus("REPLIED");
                  }}
                >
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || "Your message"}`)}`}
                  >
                    <Reply className="size-3.5" /> Reply by email
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    navigator.clipboard.writeText(selected.email);
                    toast.success("Email address copied");
                  }}
                >
                  <User className="size-3.5" /> Copy address
                </Button>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  Replying via your email client
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              The enquiry will be permanently removed from the database. This cannot be undone.
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
