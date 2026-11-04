"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { settingsSchema } from "@/lib/validators";

type Result = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function updateSettingsAction(formData: FormData): Promise<Result> {
  await requireAdmin();

  const socials: { label: string; href: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const label = String(formData.get(`socialLabel-${i}`) || "").trim();
    const href = String(formData.get(`socialHref-${i}`) || "").trim();
    if (label && href) socials.push({ label, href });
  }

  const parsed = settingsSchema.safeParse({
    fullName: String(formData.get("fullName") || ""),
    title: String(formData.get("title") || ""),
    tagline: String(formData.get("tagline") || ""),
    bio: String(formData.get("bio") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    location: String(formData.get("location") || ""),
    education: String(formData.get("education") || ""),
    hometown: String(formData.get("hometown") || ""),
    avatarUrl: String(formData.get("avatarUrl") || ""),
    resumeUrl: String(formData.get("resumeUrl") || ""),
    availability: String(formData.get("availability") || ""),
    heroNote: String(formData.get("heroNote") || ""),
    seoTitle: String(formData.get("seoTitle") || ""),
    seoDescription: String(formData.get("seoDescription") || ""),
    socials,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;

  try {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        fullName: data.fullName,
        title: data.title,
        tagline: data.tagline || null,
        bio: data.bio || null,
        email: data.email || null,
        phone: data.phone || null,
        location: data.location || null,
        education: data.education || null,
        hometown: data.hometown || null,
        avatarUrl: data.avatarUrl || null,
        resumeUrl: data.resumeUrl || null,
        availability: data.availability || null,
        heroNote: data.heroNote || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        socials: JSON.stringify(socials),
      },
      update: {
        fullName: data.fullName,
        title: data.title,
        tagline: data.tagline || null,
        bio: data.bio || null,
        email: data.email || null,
        phone: data.phone || null,
        location: data.location || null,
        education: data.education || null,
        hometown: data.hometown || null,
        avatarUrl: data.avatarUrl || null,
        resumeUrl: data.resumeUrl || null,
        availability: data.availability || null,
        heroNote: data.heroNote || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        socials: JSON.stringify(socials),
      },
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/interests");
    revalidatePath("/photos");
    revalidatePath("/admin/settings");

    return { ok: true };
  } catch (error) {
    console.error("settings update failed", error);
    return { error: "Could not save settings. Please try again." };
  }
}
