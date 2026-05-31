"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BUILDING_TYPES,
  CONCRETE_STRENGTHS,
  SEISMIC_ZONES,
  SOIL_TYPES,
  STEEL_GRADES,
  WIND_ZONES,
} from "@/constants/engineering";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createProject, updateProject } from "@/lib/storage/projects";
import type { ProjectFormInput } from "@/lib/validations/schemas";
import type { ProjectWithStudy } from "@/types";

const defaultValues: ProjectFormInput = {
  projectName: "",
  buildingType: BUILDING_TYPES[0],
  landLength: 30,
  landWidth: 20,
  numberOfFloors: 5,
  buildingHeight: 17.5,
  soilType: SOIL_TYPES[1],
  concreteStrength: CONCRETE_STRENGTHS[1],
  steelGrade: STEEL_GRADES[1],
  seismicZone: SEISMIC_ZONES[2],
  windZone: WIND_ZONES[2],
  hasParking: false,
};

interface ProjectFormProps {
  initialData?: ProjectWithStudy;
  mode?: "create" | "edit";
  onSuccess?: (project: ProjectWithStudy) => void;
}

export function ProjectForm({ initialData, mode = "create", onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormInput>(
    initialData
      ? {
          projectName: initialData.projectName,
          buildingType: initialData.buildingType,
          landLength: initialData.landLength,
          landWidth: initialData.landWidth,
          numberOfFloors: initialData.numberOfFloors,
          buildingHeight: initialData.buildingHeight,
          soilType: initialData.soilType,
          concreteStrength: initialData.concreteStrength,
          steelGrade: initialData.steelGrade,
          seismicZone: initialData.seismicZone,
          windZone: initialData.windZone,
          hasParking: initialData.hasParking,
        }
      : defaultValues,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  function updateField<K extends keyof ProjectFormInput>(key: K, value: ProjectFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(generateStudy: boolean) {
    setError("");
    generateStudy ? setGenerating(true) : setLoading(true);

    try {
      let project: ProjectWithStudy;

      if (mode === "edit" && initialData) {
        project = updateProject(initialData.id, form, {
          regenerateStudy: generateStudy,
        });
      } else {
        project = createProject(form, { generateStudy });
      }

      if (onSuccess) {
        onSuccess(project);
      } else {
        router.push(`/projects/${project.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title={mode === "edit" ? "Edit Project" : "New Project"}
        description="Enter building parameters for preliminary structural analysis"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
        className="space-y-8"
      >
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Project Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Project Name"
              value={form.projectName}
              onChange={(e) => updateField("projectName", e.target.value)}
              placeholder="e.g. Riverside Tower"
              required
            />
            <Select
              label="Building Type"
              value={form.buildingType}
              onChange={(e) => updateField("buildingType", e.target.value)}
              options={[...BUILDING_TYPES]}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Site Dimensions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Land Length (m)"
              type="number"
              step="0.1"
              min="1"
              value={form.landLength}
              onChange={(e) => updateField("landLength", parseFloat(e.target.value))}
              required
            />
            <Input
              label="Land Width (m)"
              type="number"
              step="0.1"
              min="1"
              value={form.landWidth}
              onChange={(e) => updateField("landWidth", parseFloat(e.target.value))}
              required
            />
            <Input
              label="Number of Floors"
              type="number"
              min="1"
              max="100"
              value={form.numberOfFloors}
              onChange={(e) => updateField("numberOfFloors", parseInt(e.target.value, 10))}
              required
            />
            <Input
              label="Building Height (m)"
              type="number"
              step="0.1"
              min="1"
              value={form.buildingHeight}
              onChange={(e) => updateField("buildingHeight", parseFloat(e.target.value))}
              required
            />
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Materials & Site Conditions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Soil Type"
              value={form.soilType}
              onChange={(e) => updateField("soilType", e.target.value)}
              options={[...SOIL_TYPES]}
            />
            <Select
              label="Concrete Strength"
              value={form.concreteStrength}
              onChange={(e) => updateField("concreteStrength", e.target.value)}
              options={[...CONCRETE_STRENGTHS]}
            />
            <Select
              label="Steel Grade"
              value={form.steelGrade}
              onChange={(e) => updateField("steelGrade", e.target.value)}
              options={[...STEEL_GRADES]}
            />
            <Select
              label="Seismic Zone"
              value={form.seismicZone}
              onChange={(e) => updateField("seismicZone", e.target.value)}
              options={[...SEISMIC_ZONES]}
            />
            <Select
              label="Wind Zone"
              value={form.windZone}
              onChange={(e) => updateField("windZone", e.target.value)}
              options={[...WIND_ZONES]}
            />
            <Select
              label="Parking"
              value={form.hasParking ? "yes" : "no"}
              onChange={(e) => updateField("hasParking", e.target.value === "yes")}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading || generating}
          >
            Cancel
          </Button>
          <Button type="submit" variant="secondary" loading={loading} disabled={generating}>
            {mode === "edit" ? "Save Changes" : "Save Draft"}
          </Button>
          <Button
            type="button"
            loading={generating}
            disabled={loading}
            onClick={() => submit(true)}
          >
            Generate Engineering Study
          </Button>
        </div>
      </form>
    </Card>
  );
}
