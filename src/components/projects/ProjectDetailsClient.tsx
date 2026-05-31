"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Edit, Sparkles } from "lucide-react";
import { EngineeringReport } from "@/components/reports/EngineeringReport";
import { useProject } from "@/hooks/useProjects";
import { generateStudyForProject } from "@/lib/storage/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { formatDate } from "@/lib/utils/project";

interface ProjectDetailsClientProps {
  id: string;
}

export function ProjectDetailsClient({ id }: ProjectDetailsClientProps) {
  const { project, ready, refresh } = useProject(id);
  const [generating, setGenerating] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    try {
      generateStudyForProject(id);
      refresh();
    } finally {
      setGenerating(false);
    }
  }

  if (!ready) {
    return <div className="py-12 text-center text-slate-500">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Project not found.</p>
        <Link href="/projects" className="mt-4 inline-block text-blue-700 hover:underline">
          Back to Project History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/projects"
            className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{project.projectName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="info">{project.buildingType}</Badge>
            <Badge variant={project.studyGenerated ? "success" : "warning"}>
              {project.studyGenerated ? "Report Ready" : "Draft"}
            </Badge>
            <span className="text-sm text-slate-500">Updated {formatDate(project.updatedAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${project.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
          </Link>
          {!project.studyGenerated && (
            <Button loading={generating} onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" />
              Generate Study
            </Button>
          )}
        </div>
      </div>

      <Card padding="md">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
          Project Parameters
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Land Size", `${project.landLength} × ${project.landWidth} m`],
            ["Floors", String(project.numberOfFloors)],
            ["Height", `${project.buildingHeight} m`],
            ["Soil Type", project.soilType],
            ["Concrete", project.concreteStrength],
            ["Steel Grade", project.steelGrade],
            ["Seismic Zone", project.seismicZone],
            ["Wind Zone", project.windZone],
            ["Parking", project.hasParking ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {project.studyGenerated && project.studyData ? (
        <EngineeringReport project={project} study={project.studyData} />
      ) : (
        <Card className="py-16 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-blue-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No Engineering Study Yet</h3>
          <p className="mt-2 text-slate-500">
            Generate a preliminary structural study based on the project parameters.
          </p>
          <Button className="mt-6" loading={generating} onClick={handleGenerate}>
            Generate Engineering Study
          </Button>
          <div className="mx-auto mt-8 max-w-lg">
            <Disclaimer />
          </div>
        </Card>
      )}
    </div>
  );
}
