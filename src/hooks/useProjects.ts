"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAllProjects,
  searchProjects,
  STORAGE_EVENT,
} from "@/lib/storage/projects";
import type { ProjectWithStudy } from "@/types";

export function useProjects(searchQuery = "") {
  const [projects, setProjects] = useState<ProjectWithStudy[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    const data = searchQuery.trim()
      ? searchProjects(searchQuery)
      : getAllProjects();
    setProjects(data);
    setReady(true);
  }, [searchQuery]);

  useEffect(() => {
    refresh();
    window.addEventListener(STORAGE_EVENT, refresh);
    return () => window.removeEventListener(STORAGE_EVENT, refresh);
  }, [refresh]);

  return { projects, ready, refresh };
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectWithStudy | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    const all = getAllProjects();
    setProject(all.find((p) => p.id === id) ?? null);
    setReady(true);
  }, [id]);

  useEffect(() => {
    refresh();
    window.addEventListener(STORAGE_EVENT, refresh);
    return () => window.removeEventListener(STORAGE_EVENT, refresh);
  }, [refresh]);

  return { project, ready, refresh };
}
