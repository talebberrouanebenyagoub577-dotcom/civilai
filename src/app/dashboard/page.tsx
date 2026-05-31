"use client";

import Link from "next/link";
import { FileText, FolderKanban, PlusCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useProjects } from "@/hooks/useProjects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { formatDate } from "@/lib/utils/project";

export default function DashboardPage() {
  const { projects, ready } = useProjects();
  const stats = {
    totalProjects: projects.length,
    savedReports: projects.filter((p) => p.studyGenerated).length,
    recentProjects: projects.slice(0, 5),
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-slate-500">Manage your preliminary engineering studies.</p>
          </div>
          <Link href="/projects/new">
            <Button>
              <PlusCircle className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Projects" value={stats.totalProjects} icon={FolderKanban} />
          <StatCard
            title="Saved Reports"
            value={stats.savedReports}
            icon={FileText}
            description="Projects with generated studies"
          />
          <StatCard
            title="Recent Activity"
            value={stats.recentProjects.length}
            icon={PlusCircle}
            description="Latest project updates"
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>

        <Card>
          <CardHeader
            title="Recent Projects"
            description="Your latest engineering project activity"
            action={
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            }
          />

          {!ready ? (
            <div className="py-12 text-center text-slate-500">Loading...</div>
          ) : stats.recentProjects.length === 0 ? (
            <div className="py-12 text-center">
              <FolderKanban className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">No projects yet</p>
              <Link href="/projects/new" className="mt-4 inline-block">
                <Button size="sm">Create Your First Project</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-3 font-semibold text-slate-600">Project Name</th>
                    <th className="pb-3 font-semibold text-slate-600">Type</th>
                    <th className="pb-3 font-semibold text-slate-600">Floors</th>
                    <th className="pb-3 font-semibold text-slate-600">Status</th>
                    <th className="pb-3 font-semibold text-slate-600">Updated</th>
                    <th className="pb-3 font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentProjects.map((project) => (
                    <tr key={project.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 font-medium text-slate-900">{project.projectName}</td>
                      <td className="py-3 text-slate-600">{project.buildingType}</td>
                      <td className="py-3 text-slate-600">{project.numberOfFloors}</td>
                      <td className="py-3">
                        <Badge variant={project.studyGenerated ? "success" : "warning"}>
                          {project.studyGenerated ? "Report Ready" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-3 text-slate-500">{formatDate(project.updatedAt)}</td>
                      <td className="py-3">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
