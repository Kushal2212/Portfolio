"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { musicSchema } from "@/lib/validators";

type Result = { ok?: boolean; error?: string };

/**
 * Accepts "3:46", "226" or any mm:ss string and returns whole seconds.
 * An empty value clears the length.
 */
function parseDuration(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return { ok: true, seconds: undefined } as const;

  let seconds: number | undefined;
  if (/^\d+$/.test(text)) {
    seconds = Number(text);
  } else {
    const match = /^(\d{1,3}):([0-5]\d)$/.exec(text);
    seconds = match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
  }

  if (seconds === undefined || seconds < 1 || seconds > 21_600) {
    return { ok: false, error: "Use a track length like 3:46." } as const;
  }

  return { ok: true, seconds } as const;
}

function parseTrack(formData: FormData) {
  const duration = parseDuration(formData.get("duration"));
  if (!duration.ok) return { ok: false, error: duration.error } as const;

  const parsed = musicSchema.safeParse({
    title: String(formData.get("title") || ""),
    artist: String(formData.get("artist") || ""),
    album: String(formData.get("album") || ""),
    year: formData.get("year") ?? "",
    coverUrl: String(formData.get("coverUrl") || ""),
    link: String(formData.get("link") || ""),
    audioUrl: String(formData.get("audioUrl") || ""),
    duration: duration.seconds,
    note: String(formData.get("note") || ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Check the fields.",
    } as const;
  }

  const data = parsed.data;

  return {
    ok: true,
    data: {
      title: data.title,
      artist: data.artist,
      album: data.album || null,
      year: data.year ?? null,
      coverUrl: data.coverUrl || null,
      link: data.link || null,
      audioUrl: data.audioUrl || null,
      duration: data.duration ?? null,
      note: data.note || null,
      published: formData.get("published") === "true",
    },
  } as const;
}

function revalidateMusic() {
  revalidatePath("/music");
  revalidatePath("/");
  revalidatePath("/admin/music");
}

export async function createTrackAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = parseTrack(formData);
  if (!parsed.ok) return { error: parsed.error };

  try {
    const max = await prisma.track.aggregate({ _max: { order: true } });
    await prisma.track.create({
      data: { ...parsed.data, order: (max._max.order ?? 0) + 1 },
    });
    revalidateMusic();
    return { ok: true };
  } catch {
    return { error: "Could not add the track." };
  }
}

export async function updateTrackAction(id: string, formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = parseTrack(formData);
  if (!parsed.ok) return { error: parsed.error };

  try {
    await prisma.track.update({ where: { id }, data: parsed.data });
    revalidateMusic();
    return { ok: true };
  } catch {
    return { error: "Could not update the track." };
  }
}

export async function setTrackPublishedAction(id: string, published: boolean): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.track.update({ where: { id }, data: { published } });
    revalidateMusic();
    return { ok: true };
  } catch {
    return { error: "Could not update the track." };
  }
}

export async function deleteTrackAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.track.delete({ where: { id } });
    revalidateMusic();
    return { ok: true };
  } catch {
    return { error: "Could not delete the track." };
  }
}

export async function reorderTracksAction(ids: string[]): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.$transaction(
      ids.map((id, index) => prisma.track.update({ where: { id }, data: { order: index } })),
    );
    revalidateMusic();
    return { ok: true };
  } catch {
    return { error: "Could not reorder the tracks." };
  }
}
