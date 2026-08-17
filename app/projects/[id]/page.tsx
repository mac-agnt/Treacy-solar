import { notFound } from "next/navigation";
import { PROJECTS, getProject } from "@/lib/data/projects";
import { ProjectDetail } from "@/components/modules/projects/ProjectDetail";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getProject(id)) notFound();
  return <ProjectDetail id={id} />;
}
