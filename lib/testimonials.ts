import "server-only";

import { prisma } from "@/lib/prisma";

export type PublicTestimonial = {
  quote: string;
  name: string;
  role: string;
};

/**
 * Returns published testimonials for the home page. `null` means there are no
 * rows at all (or the database could not be reached), which lets the caller
 * fall back to the built-in examples. An empty array means testimonials exist
 * but every one is currently hidden.
 */
export async function getPublicTestimonials(): Promise<PublicTestimonial[] | null> {
  try {
    const rows = await prisma.testimonial.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return null;

    return rows
      .filter((row) => row.published)
      .map((row) => ({
        quote: row.quote,
        name: row.name,
        role: row.role ?? "",
      }));
  } catch {
    return null;
  }
}
