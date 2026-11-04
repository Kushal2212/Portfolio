"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

type Result = { ok?: boolean; error?: string };

export async function updateMediaAction(
  id: string,
  data: { altText?: string; caption?: string; published?: boolean; filename?: string; order?: number },
): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.media.update({
      where: { id },
      data: {
        ...(data.altText !== undefined ? { altText: data.altText.slice(0, 200) } : {}),
        ...(data.caption !== undefined ? { caption: data.caption.slice(0, 240) || null } : {}),
        ...(data.published !== undefined ? { published: data.published } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(data.filename ? { filename: data.filename.slice(0, 160) } : {}),
      },
    });
    revalidatePath("/admin/media");
    revalidatePath("/photos");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { error: "Could not update the image." };
  }
}

export async function deleteMediaAction(ids: string[]): Promise<Result> {
  await requireAdmin();
  if (!ids.length) return { error: "Nothing selected." };

  try {
    const media = await prisma.media.findMany({ where: { id: { in: ids } } });
    await prisma.media.deleteMany({ where: { id: { in: ids } } });

    for (const item of media) {
      if (item.publicId) {
        await deleteFromCloudinary(item.publicId).catch((error) => {
          console.error("Could not remove Cloudinary asset", item.publicId, error);
        });
      } else if (item.url.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", item.url.replace(/^\//, ""));
        await unlink(filePath).catch(() => {});
      }
    }

    revalidatePath("/admin/media");
    revalidatePath("/photos");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { error: "Could not delete the selected images." };
  }
}
