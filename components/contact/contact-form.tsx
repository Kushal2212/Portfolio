"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Loader2, Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validators";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@/components/contact/turnstile";
import { cn } from "@/lib/utils";

const subjects = ["Project enquiry", "Freelance work", "Full-time role", "Collaboration", "Just saying hi"];

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState("");
  const [subjectChoice, setSubjectChoice] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", phone: "", message: "", company: "" },
  });

  React.useEffect(() => {
    setValue("subject", subjectChoice);
  }, [subjectChoice, setValue]);

  async function onSubmit(values: ContactInput) {
    setSent(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) {
          toast.error("Please check the highlighted fields.");
        } else {
          toast.error(data.error || "Something went wrong. Try again in a moment.");
        }
        return;
      }

      setSent(true);
      reset();
      setSubjectChoice("");
      setTurnstileToken("");
      toast.success("Message sent", {
        description: "Thanks for writing. I'll get back to you soon.",
      });
    } catch {
      toast.error("Network error. Please try again, or email me directly.");
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-strong/15 text-brand">
          <Check className="size-6" />
        </span>
        <h2 className="mt-5 font-serif text-3xl">Message received.</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thanks for taking the time. I read every note personally and usually reply within a day or
          two.
        </p>
        <Button variant="outline" className="mt-6 rounded-full" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-card p-6 sm:p-8"
      noValidate
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Tell me about it</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            A few sentences is plenty. The form takes about a minute.
          </p>
        </div>
        <span className="hidden rounded-full border border-border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground sm:block">
          * required
        </span>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Name <span className="text-brand">*</span>
          </Label>
          <Input id="name" placeholder="Ada Lovelace" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-brand">*</span>
          </Label>
          <Input id="email" type="email" placeholder="ada@example.com" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="subject">What&apos;s this about?</Label>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setSubjectChoice(subjectChoice === subject ? "" : subject)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                subjectChoice === subject
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {subject}
            </button>
          ))}
        </div>
        <Input
          id="subject"
          placeholder="Or write your own subject"
          className="mt-1"
          {...register("subject")}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && <p className="text-[11px] text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="mt-5 space-y-1.5">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" type="tel" placeholder="+977 …" autoComplete="tel" {...register("phone")} />
      </div>

      <div className="mt-5 space-y-1.5">
        <Label htmlFor="message">
          Message <span className="text-brand">*</span>
        </Label>
        <Textarea
          id="message"
          rows={7}
          placeholder="A little context helps: what you're building, the timeline, and what a good outcome looks like…"
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-[11px] text-destructive">{errors.message.message}</p>}
      </div>

      {/* Honeypot — hidden from humans and screen readers */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="mt-6">
        <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onToken={setTurnstileToken} />
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[10px] leading-relaxed text-muted-foreground">
          Your details stay private. No newsletter, no resale, no nonsense. See the{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            privacy note
          </a>
          .
        </p>
        <Button type="submit" size="lg" variant="brand" disabled={isSubmitting} className="group shrink-0">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send message
              <Send className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
