"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Result = { ok?: boolean; error?: string };

const STATUSES = ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const;
type MessageStatus = (typeof STATUSES)[number];

export async function updateMessageStatusAction(
  id: string,
  status: MessageStatus,
): Promise<Result> {
  await requireAdmin();
  if (!STATUSES.includes(status)) return { error: "Invalid status." };
  try {
    await prisma.message.update({ where: { id }, data: { status } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { error: "Could not update the message." };
  }
}

export async function bulkMessageStatusAction(
  ids: string[],
  status: MessageStatus,
): Promise<Result> {
  await requireAdmin();
  if (!STATUSES.includes(status)) return { error: "Invalid status." };
  try {
    await prisma.message.updateMany({ where: { id: { in: ids } }, data: { status } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { error: "Could not update the messages." };
  }
}

export async function deleteMessagesAction(ids: string[]): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.message.deleteMany({ where: { id: { in: ids } } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { error: "Could not delete the messages." };
  }
}
