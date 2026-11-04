"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { interestSchema } from "@/lib/validators";

type Result = { ok?: boolean; error?: string };

export async function createInterestAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = interestSchema.safeParse({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    icon: String(formData.get("icon") || ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Check the fields." };

  try {
    const max = await prisma.interest.aggregate({ _max: { order: true } });
    await prisma.interest.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        icon: parsed.data.icon || null,
        order: (max._max.order ?? 0) + 1,
      },
    });
    revalidatePath("/interests");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { error: "Could not add the interest." };
  }
}

export async function updateInterestAction(id: string, formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = interestSchema.safeParse({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    icon: String(formData.get("icon") || ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Check the fields." };

  try {
    await prisma.interest.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        icon: parsed.data.icon || null,
      },
    });
    revalidatePath("/interests");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { error: "Could not update the interest." };
  }
}

export async function deleteInterestAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.interest.delete({ where: { id } });
    revalidatePath("/interests");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { error: "Could not delete the interest." };
  }
}

export async function reorderInterestsAction(ids: string[]): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.$transaction(
      ids.map((id, index) => prisma.interest.update({ where: { id }, data: { order: index } })),
    );
    revalidatePath("/interests");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch {
    return { error: "Could not reorder the interests." };
  }
}
