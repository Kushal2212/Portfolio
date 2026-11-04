"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = { error?: string; success?: string };

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(changePasswordAction, {});
  const last = React.useRef(state);

  React.useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand/10 text-brand">
          <KeyRound className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Change password</p>
          <p className="text-[11px] text-muted-foreground">Use at least 8 characters. You&apos;ll stay signed in.</p>
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11px] text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-600 dark:text-emerald-400">
          <Check className="size-3" /> {state.success}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
      </div>

      <Button type="submit" className="rounded-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
