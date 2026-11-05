import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/stat-card";
import { ProjectsManager } from "@/components/admin/projects-manager";

export const metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project
    .findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
    .catch(() => []);

  const published = projects.filter((project) => project.published).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Projects"
        description={
          projects.length === 0
            ? "Built-in sample projects are live on the home page. Add your first project to replace them."
            : `${projects.length} ${projects.length === 1 ? "entry" : "entries"} · ${published} shown on the home page`
        }
      />

      <ProjectsManager
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          slug: project.slug,
          year: project.year,
          summary: project.summary,
          tags: project.tags,
          href: project.href,
          repo: project.repo,
          metric: project.metric,
          metricLabel: project.metricLabel,
          status: project.status,
          published: project.published,
          order: project.order,
        }))}
        usingFallback={projects.length === 0}
      />
    </div>
  );
}
