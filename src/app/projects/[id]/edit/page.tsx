"use client";

import Link from "next/link";
import { use } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { useProject } from "@/hooks/useProjects";
import { Disclaimer } from "@/components/ui/Disclaimer";

type PageProps = { params: Promise<{ id: string }> };

export default function EditProjectPage({ params }: PageProps) {
  const { id } = use(params);
  const { project, ready } = useProject(id);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Project</h1>
          <p className="mt-1 text-slate-500">Update project parameters and regenerate the engineering study.</p>
        </div>

        {!ready ? (
          <div className="py-12 text-center text-slate-500">Loading project...</div>
        ) : !project ? (
          <div className="py-12 text-center">
            <p className="text-slate-500">Project not found.</p>
            <Link href="/projects" className="mt-4 inline-block text-blue-700 hover:underline">
              Back to Project History
            </Link>
          </div>
        ) : (
          <>
            <ProjectForm initialData={project} mode="edit" />
            <Disclaimer />
          </>
        )}
      </div>
    </AppLayout>
  );
}
