"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  AtSign,
  Check,
  ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { updateSettingsAction } from "@/actions/settings";
import type { Settings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Result = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 rounded-xl border border-border bg-card p-5 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(
    (_previousState, formData) => updateSettingsAction(formData),
    {},
  );
  const [socials, setSocials] = React.useState(
    settings.socials.length ? settings.socials : [{ label: "", href: "" }],
  );
  const [avatar, setAvatar] = React.useState(settings.avatarUrl);
  const [seoTitle, setSeoTitle] = React.useState(settings.seoTitle);
  const [seoDesc, setSeoDesc] = React.useState(settings.seoDescription);
  const lastState = React.useRef(state);

  React.useEffect(() => {
    if (state === lastState.current) return;
    lastState.current = state;
    if (state.ok) toast.success("Settings saved");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          {state.error}
        </div>
      )}

      <Section
        title="Identity"
        description="The words that greet people on the landing page and about page."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={settings.fullName} required />
            {state.fieldErrors?.fullName && <p className="text-[10px] text-destructive">{state.fieldErrors.fullName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title / role</Label>
            <Input id="title" name="title" defaultValue={settings.title} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tagline">Tagline</Label>
          <Textarea id="tagline" name="tagline" defaultValue={settings.tagline} className="min-h-16" />
          <p className="text-[10px] text-muted-foreground">Shown under your name on the home page.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" defaultValue={settings.bio} className="min-h-28" />
          <p className="text-[10px] text-muted-foreground">Two or three sentences. The longer story lives on the About page.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="heroNote">Currently note</Label>
          <Input id="heroNote" name="heroNote" defaultValue={settings.heroNote} placeholder="Currently building…" />
        </div>
      </Section>

      <Section
        title="Contact & availability"
        description="How people reach you, where you're based and whether you're open for work."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" defaultValue={settings.email} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={settings.phone} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input id="location" name="location" defaultValue={settings.location} className="pl-9" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              name="education"
              defaultValue={settings.education}
              placeholder="BSc.CSIT, Tribhuvan University"
            />
            <p className="text-[10px] text-muted-foreground">Shown on the home page and About page.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hometown">Hometown</Label>
            <Input
              id="hometown"
              name="hometown"
              defaultValue={settings.hometown}
              placeholder="Madi, Sankhuwasabha"
            />
            <p className="text-[10px] text-muted-foreground">A shorter place label for cards and captions.</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="availability">Availability label</Label>
          <Input id="availability" name="availability" defaultValue={settings.availability} placeholder="Available for select projects" />
        </div>
      </Section>

      <Section
        title="Images & files"
        description="Profile photo and résumé. Upload files in the media library, then paste the URL here."
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              defaultValue={settings.avatarUrl}
              onChange={(event) => setAvatar(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <div className="size-11 overflow-hidden rounded-full border border-border bg-muted">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Avatar preview" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="size-4" />
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resumeUrl">Résumé URL</Label>
          <Input id="resumeUrl" name="resumeUrl" defaultValue={settings.resumeUrl} placeholder="/uploads/resume.pdf" />
        </div>
      </Section>

      <Section
        title="Social links"
        description="Labels like GitHub, LinkedIn, X / Twitter or Dribbble get the matching icon."
      >
        <div className="space-y-2">
          {socials.map((social, index) => (
            <div key={index} className="flex gap-2">
              <Input
                name={`socialLabel-${index}`}
                value={social.label}
                onChange={(event) =>
                  setSocials((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, label: event.target.value } : item,
                    ),
                  )
                }
                placeholder="GitHub"
                className="w-32 shrink-0"
                aria-label={`Social label ${index + 1}`}
              />
              <Input
                name={`socialHref-${index}`}
                value={social.href}
                onChange={(event) =>
                  setSocials((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, href: event.target.value } : item,
                    ),
                  )
                }
                placeholder="https://github.com/you"
                aria-label={`Social URL ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => setSocials((current) => current.filter((_, i) => i !== index))}
                aria-label="Remove social link"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
          {socials.length < 8 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-[11px] text-muted-foreground"
              onClick={() => setSocials((current) => [...current, { label: "", href: "" }])}
            >
              <Plus className="size-3" /> Add another
            </Button>
          )}
        </div>
      </Section>

      <Section
        title="SEO defaults"
        description="Used for the site-wide title, description and social previews."
      >
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">Default title</Label>
          <Input
            id="seoTitle"
            name="seoTitle"
            defaultValue={settings.seoTitle}
            maxLength={70}
            onChange={(event) => setSeoTitle(event.target.value)}
          />
          <p className="text-right font-mono text-[9px] text-muted-foreground">{seoTitle.length}/70</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">Default meta description</Label>
          <Textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={settings.seoDescription}
            maxLength={180}
            className="min-h-20"
            onChange={(event) => setSeoDesc(event.target.value)}
          />
          <p className="text-right font-mono text-[9px] text-muted-foreground">{seoDesc.length}/180</p>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-2 rounded-xl border border-border bg-card p-3">
        {state.ok && (
          <span className="mr-auto inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            <Check className="size-3.5" /> Saved
          </span>
        )}
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
