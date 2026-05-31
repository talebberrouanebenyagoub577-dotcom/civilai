"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Edit, Eye, Search, Trash2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { deleteProject, duplicateProject } from "@/lib/storage/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils/project";

export function ProjectHistoryTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { projects, ready } = useProjects(search);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete project "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      deleteProject(id);
    } finally {
      setDeletingId(null);
    }
  }

  function handleDuplicate(id: string) {
    setDuplicatingId(id);
    try {
      const duplicate = duplicateProject(id);
      router.push(`/projects/${duplicate.id}`);
    } catch {
      // project not found
    } finally {
      setDuplicatingId(null);
    }
  }

  return (
    <Card>
      <CardHeader
        title="All Projects"
        description={`${projects.length} project${projects.length !== 1 ? "s" : ""} found`}
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by project name or building type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {!ready ? (
        <div className="py-12 text-center text-slate-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          {search ? "No projects match your search." : "No projects found. Create your first project."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="pb-3 pr-4 font-semibold text-slate-600">Project Name</th>
                <th className="pb-3 pr-4 font-semibold text-slate-600">Building Type</th>
                <th className="pb-3 pr-4 font-semibold text-slate-600">Dimensions</th>
                <th className="pb-3 pr-4 font-semibold text-slate-600">Floors</th>
                <th className="pb-3 pr-4 font-semibold text-slate-600">Status</th>
                <th className="pb-3 pr-4 font-semibold text-slate-600">Updated</th>
                <th className="pb-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 pr-4 font-medium text-slate-900">{project.projectName}</td>
                  <td className="py-3 pr-4 text-slate-600">{project.buildingType}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    {project.landLength} × {project.landWidth} m
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{project.numberOfFloors}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={project.studyGenerated ? "success" : "warning"}>
                      {project.studyGenerated ? "Report Ready" : "Draft"}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{formatDate(project.updatedAt)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/projects/${project.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Duplicate"
                        loading={duplicatingId === project.id}
                        onClick={() => handleDuplicate(project.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        loading={deletingId === project.id}
                        onClick={() => handleDelete(project.id, project.projectName)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
