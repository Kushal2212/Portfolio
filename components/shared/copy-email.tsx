"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email copied", { description: email });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy. Select it manually.");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs transition-colors hover:border-brand/40 hover:text-foreground",
        className,
      )}
      aria-label={`Copy ${email}`}
    >
      <span className="truncate">{email}</span>
      {copied ? <Check className="size-3 text-brand" /> : <Copy className="size-3 text-muted-foreground" />}
    </button>
  );
}
