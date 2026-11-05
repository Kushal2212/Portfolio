"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { projectSchema } from "@/lib/validators";

type Result = { ok?: boolean; error?: string };

function parseProject(formData: FormData) {
  const parsed = projectSchema.safeParse({
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    year: String(formData.get("year") || ""),
    summary: String(formData.get("summary") || ""),
    tags: String(formData.get("tags") || ""),
    coverImage: String(formData.get("coverImage") || ""),
    href: String(formData.get("href") || ""),
    repo: String(formData.get("repo") || ""),
    metric: String(formData.get("metric") || ""),
    metricLabel: String(formData.get("metricLabel") || ""),
    status: String(formData.get("status") || "Live"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Check the fields." } as const;
  }

  const data = parsed.data;
  const tags = (data.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    data: {
      name: data.name,
      slug: data.slug,
      year: data.year,
      summary: data.summary,
      tags,
      href: data.href || null,
      repo: data.repo || null,
      coverImage: data.coverImage || null,
      metric: data.metric || null,
      metricLabel: data.metricLabel || null,
      status: data.status,
      published: formData.get("published") === "true",
    },
  } as const;
}

function revalidateProjects() {
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function createProjectAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = parseProject(formData);
  if ("error" in parsed) return parsed;

  try {
    const max = await prisma.project.aggregate({ _max: { order: true } });
    await prisma.project.create({
      data: { ...parsed.data, order: (max._max.order ?? -1) + 1 },
    });
    revalidateProjects();
    return { ok: true };
  } catch {
    return { error: "Could not add the project. Is that slug already in use?" };
  }
}

export async function updateProjectAction(id: string, formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = parseProject(formData);
  if ("error" in parsed) return parsed;

  try {
    await prisma.project.update({ where: { id }, data: parsed.data });
    revalidateProjects();
    return { ok: true };
  } catch {
    return { error: "Could not update the project. Is that slug already in use?" };
  }
}

export async function setProjectPublishedAction(id: string, published: boolean): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.project.update({ where: { id }, data: { published } });
    revalidateProjects();
    return { ok: true };
  } catch {
    return { error: "Could not update the project." };
  }
}

export async function deleteProjectAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.project.delete({ where: { id } });
    revalidateProjects();
    return { ok: true };
  } catch {
    return { error: "Could not delete the project." };
  }
}

export async function reorderProjectsAction(ids: string[]): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.$transaction(
      ids.map((id, index) => prisma.project.update({ where: { id }, data: { order: index } })),
    );
    revalidateProjects();
    return { ok: true };
  } catch {
    return { error: "Could not reorder the projects." };
  }
}
