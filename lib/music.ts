import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const trackSelect = {
  id: true,
  title: true,
  artist: true,
  album: true,
  year: true,
  coverUrl: true,
  link: true,
  note: true,
  published: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TrackSelect;

export type MusicTrack = Prisma.TrackGetPayload<{ select: typeof trackSelect }>;

const trackOrder: Prisma.TrackOrderByWithRelationInput[] = [
  { order: "asc" },
  { createdAt: "desc" },
];

export async function getPublishedTracks(limit?: number): Promise<MusicTrack[]> {
  try {
    return await prisma.track.findMany({
      where: { published: true },
      select: trackSelect,
      orderBy: trackOrder,
      ...(limit ? { take: limit } : {}),
    });
  } catch {
    return [];
  }
}

export async function getAdminTracks(): Promise<MusicTrack[]> {
  try {
    return await prisma.track.findMany({
      select: trackSelect,
      orderBy: trackOrder,
    });
  } catch {
    return [];
  }
}
