"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectHistoryTable } from "@/components/projects/ProjectHistoryTable";
import { Button } from "@/components/ui/Button";

export default function ProjectHistoryPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Project History</h1>
            <p className="mt-1 text-slate-500">Search, manage, and review all your engineering projects.</p>
          </div>
          <Link href="/projects/new">
            <Button>
              <PlusCircle className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        <ProjectHistoryTable />
      </div>
    </AppLayout>
  );
}
