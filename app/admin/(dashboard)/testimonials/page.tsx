import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/stat-card";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export const metadata = { title: "Testimonials" };
export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial
    .findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
    .catch(() => []);

  const published = testimonials.filter((item) => item.published).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Testimonials"
        description={
          testimonials.length === 0
            ? "Built-in sample quotes are live on the home page. Add your first testimonial to replace them."
            : `${testimonials.length} ${testimonials.length === 1 ? "entry" : "entries"} · ${published} shown on the home page`
        }
      />

      <TestimonialsManager
        testimonials={testimonials.map((item) => ({
          id: item.id,
          quote: item.quote,
          name: item.name,
          role: item.role,
          published: item.published,
          order: item.order,
        }))}
        usingFallback={testimonials.length === 0}
      />
    </div>
  );
}
