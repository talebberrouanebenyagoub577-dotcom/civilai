"use client";

import { use } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectDetailsClient } from "@/components/projects/ProjectDetailsClient";

type PageProps = { params: Promise<{ id: string }> };

export default function ProjectDetailsPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <AppLayout>
      <ProjectDetailsClient id={id} />
    </AppLayout>
  );
}
