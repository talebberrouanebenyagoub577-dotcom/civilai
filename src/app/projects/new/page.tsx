"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { Disclaimer } from "@/components/ui/Disclaimer";

export default function NewProjectPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Project</h1>
          <p className="mt-1 text-slate-500">
            Define building parameters to generate a preliminary structural engineering study.
          </p>
        </div>
        <ProjectForm />
        <Disclaimer />
      </div>
    </AppLayout>
  );
}
