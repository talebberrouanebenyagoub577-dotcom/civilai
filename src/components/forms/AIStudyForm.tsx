"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  BUILDING_TYPES,
  CONCRETE_STRENGTHS,
  SEISMIC_ZONES,
  SOIL_TYPES,
  STEEL_GRADES,
} from "@/constants/engineering";
import { generateAIStudyReport } from "@/lib/engineering/aiStudyGenerator";
import { aiStudySchema, type AIStudyFormInput } from "@/lib/validations/aiStudySchema";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AIStudyInput, AIStudyReport } from "@/types";

const defaultValues: AIStudyFormInput = {
  buildingType: BUILDING_TYPES[0],
  numberOfFloors: 5,
  landLength: 30,
  landWidth: 20,
  soilType: SOIL_TYPES[1],
  seismicZone: SEISMIC_ZONES[2],
  concreteStrength: CONCRETE_STRENGTHS[1],
  steelGrade: STEEL_GRADES[1],
};

interface AIStudyFormProps {
  onGenerate: (input: AIStudyInput, report: AIStudyReport) => void;
}

export function AIStudyForm({ onGenerate }: AIStudyFormProps) {
  const [form, setForm] = useState<AIStudyFormInput>(defaultValues);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  function updateField<K extends keyof AIStudyFormInput>(key: K, value: AIStudyFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerate() {
    setError("");
    setGenerating(true);

    try {
      const parsed = aiStudySchema.safeParse(form);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Invalid input");
        return;
      }

      const input: AIStudyInput = parsed.data;
      const report = generateAIStudyReport(input);
      onGenerate(input, report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate study");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Building Parameters"
        description="Enter site and structural data to generate a preliminary AI engineering study"
      />

      <div className="space-y-8">
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Building & Site
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Building Type"
              value={form.buildingType}
              onChange={(e) => updateField("buildingType", e.target.value)}
              options={[...BUILDING_TYPES]}
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
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Materials & Conditions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Soil Type"
              value={form.soilType}
              onChange={(e) => updateField("soilType", e.target.value)}
              options={[...SOIL_TYPES]}
            />
            <Select
              label="Seismic Zone"
              value={form.seismicZone}
              onChange={(e) => updateField("seismicZone", e.target.value)}
              options={[...SEISMIC_ZONES]}
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
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <Button loading={generating} onClick={handleGenerate} size="lg">
            <Sparkles className="h-4 w-4" />
            Generate Preliminary Study
          </Button>
        </div>
      </div>
    </Card>
  );
}
