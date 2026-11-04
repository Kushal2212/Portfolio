"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { testimonialSchema } from "@/lib/validators";

type Result = { ok?: boolean; error?: string };

function parseTestimonial(formData: FormData) {
  const parsed = testimonialSchema.safeParse({
    quote: String(formData.get("quote") || ""),
    name: String(formData.get("name") || ""),
    role: String(formData.get("role") || ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Check the fields." } as const;
  }

  return {
    data: {
      quote: parsed.data.quote,
      name: parsed.data.name,
      role: parsed.data.role || null,
      published: formData.get("published") === "true",
    },
  } as const;
}

function revalidateTestimonials() {
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function createTestimonialAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = parseTestimonial(formData);
  if ("error" in parsed) return parsed;

  try {
    const max = await prisma.testimonial.aggregate({ _max: { order: true } });
    await prisma.testimonial.create({
      data: { ...parsed.data, order: (max._max.order ?? -1) + 1 },
    });
    revalidateTestimonials();
    return { ok: true };
  } catch {
    return { error: "Could not add the testimonial." };
  }
}

export async function updateTestimonialAction(id: string, formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = parseTestimonial(formData);
  if ("error" in parsed) return parsed;

  try {
    await prisma.testimonial.update({ where: { id }, data: parsed.data });
    revalidateTestimonials();
    return { ok: true };
  } catch {
    return { error: "Could not update the testimonial." };
  }
}

export async function setTestimonialPublishedAction(
  id: string,
  published: boolean,
): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.testimonial.update({ where: { id }, data: { published } });
    revalidateTestimonials();
    return { ok: true };
  } catch {
    return { error: "Could not update the testimonial." };
  }
}

export async function deleteTestimonialAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.testimonial.delete({ where: { id } });
    revalidateTestimonials();
    return { ok: true };
  } catch {
    return { error: "Could not delete the testimonial." };
  }
}

export async function reorderTestimonialsAction(ids: string[]): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.$transaction(
      ids.map((id, index) => prisma.testimonial.update({ where: { id }, data: { order: index } })),
    );
    revalidateTestimonials();
    return { ok: true };
  } catch {
    return { error: "Could not reorder the testimonials." };
  }
}
