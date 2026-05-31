import { generateEngineeringStudy } from "@/lib/engineering/generator";
import { projectSchema, type ProjectFormInput } from "@/lib/validations/schemas";
import type { ProjectWithStudy } from "@/types";

const STORAGE_KEY = "civilai_projects";
export const STORAGE_EVENT = "civilai-projects-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyChange(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
}

function readAll(): ProjectWithStudy[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProjectWithStudy[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(projects: ProjectWithStudy[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  notifyChange();
}

function sortByUpdated(projects: ProjectWithStudy[]): ProjectWithStudy[] {
  return [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function createId(): string {
  return crypto.randomUUID();
}

function validateInput(data: ProjectFormInput): ProjectFormInput {
  const result = projectSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid project data");
  }
  return result.data;
}

export function getAllProjects(): ProjectWithStudy[] {
  return sortByUpdated(readAll());
}

export function getProjectById(id: string): ProjectWithStudy | null {
  return readAll().find((p) => p.id === id) ?? null;
}

export function searchProjects(query: string): ProjectWithStudy[] {
  const q = query.trim().toLowerCase();
  const all = getAllProjects();
  if (!q) return all;
  return all.filter(
    (p) =>
      p.projectName.toLowerCase().includes(q) ||
      p.buildingType.toLowerCase().includes(q),
  );
}

export function createProject(
  data: ProjectFormInput,
  options?: { generateStudy?: boolean },
): ProjectWithStudy {
  const valid = validateInput(data);
  const now = new Date().toISOString();
  const generateStudy = options?.generateStudy === true;

  const project: ProjectWithStudy = {
    id: createId(),
    ...valid,
    studyGenerated: generateStudy,
    studyData: generateStudy ? generateEngineeringStudy(valid) : null,
    createdAt: now,
    updatedAt: now,
  };

  const projects = readAll();
  projects.push(project);
  writeAll(projects);
  return project;
}

export function updateProject(
  id: string,
  data: ProjectFormInput,
  options?: { regenerateStudy?: boolean },
): ProjectWithStudy {
  const valid = validateInput(data);
  const projects = readAll();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Project not found");

  const existing = projects[index];
  const regenerateStudy = options?.regenerateStudy === true;

  const updated: ProjectWithStudy = {
    ...existing,
    ...valid,
    updatedAt: new Date().toISOString(),
    ...(regenerateStudy
      ? {
          studyGenerated: true,
          studyData: generateEngineeringStudy(valid),
        }
      : {}),
  };

  projects[index] = updated;
  writeAll(projects);
  return updated;
}

export function deleteProject(id: string): void {
  const projects = readAll().filter((p) => p.id !== id);
  writeAll(projects);
}

export function duplicateProject(id: string): ProjectWithStudy {
  const original = getProjectById(id);
  if (!original) throw new Error("Project not found");

  const now = new Date().toISOString();
  const duplicate: ProjectWithStudy = {
    ...original,
    id: createId(),
    projectName: `${original.projectName} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  const projects = readAll();
  projects.push(duplicate);
  writeAll(projects);
  return duplicate;
}

export function generateStudyForProject(id: string): ProjectWithStudy {
  const projects = readAll();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Project not found");

  const existing = projects[index];
  const studyData = generateEngineeringStudy(existing);

  const updated: ProjectWithStudy = {
    ...existing,
    studyGenerated: true,
    studyData,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;
  writeAll(projects);
  return updated;
}
