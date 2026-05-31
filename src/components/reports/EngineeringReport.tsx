"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { exportReportToPdf } from "@/lib/pdf/exportReport";
import { formatDateTime } from "@/lib/utils/project";
import type { EngineeringStudy, ProjectInput } from "@/types";

interface EngineeringReportProps {
  project: ProjectInput & { id?: string; createdAt?: string };
  study: EngineeringStudy;
}

function ReportSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-100 pb-6 last:border-0">
      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-blue-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function DataTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-slate-100 last:border-0">
              <td className="w-1/3 bg-slate-50 px-4 py-2.5 font-medium text-slate-600">{label}</td>
              <td className="px-4 py-2.5 text-slate-900">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulletList({ items, variant = "default" }: { items: string[]; variant?: "default" | "warning" }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className={`flex gap-2 text-sm leading-relaxed ${
            variant === "warning" ? "text-red-800" : "text-slate-700"
          }`}
        >
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${variant === "warning" ? "bg-red-500" : "bg-blue-500"}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function EngineeringReport({ project, study }: EngineeringReportProps) {
  async function handleExportPdf() {
    await exportReportToPdf(project, study);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-blue-200">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Preliminary Engineering Study</span>
              </div>
              <h1 className="text-2xl font-bold">{project.projectName}</h1>
              <p className="mt-2 text-blue-100">
                {project.buildingType} · {project.numberOfFloors} floors ·{" "}
                {project.landLength} m × {project.landWidth} m
              </p>
            </div>
            <Button
              variant="secondary"
              className="shrink-0 border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={handleExportPdf}
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
          <p className="mt-4 text-xs text-blue-200">
            Generated: {formatDateTime(study.generatedAt)}
          </p>
        </div>

        <div className="space-y-8 p-6 lg:p-8">
          <ReportSection number="1" title="Preliminary Structural Study">
            <p className="text-sm leading-relaxed text-slate-700">{study.preliminaryStructuralStudy}</p>
          </ReportSection>

          <ReportSection number="2" title="Recommended Column Grid">
            <DataTable
              rows={[
                ["Columns (X direction)", String(study.recommendedColumnGrid.columnsX)],
                ["Columns (Y direction)", String(study.recommendedColumnGrid.columnsY)],
                ["Total Columns", String(study.recommendedColumnGrid.totalColumns)],
                ["Layout Description", study.recommendedColumnGrid.description],
              ]}
            />
          </ReportSection>

          <ReportSection number="3" title="Suggested Column Spacing">
            <DataTable
              rows={[
                ["Spacing X", `${study.suggestedColumnSpacing.spacingX} ${study.suggestedColumnSpacing.unit}`],
                ["Spacing Y", `${study.suggestedColumnSpacing.spacingY} ${study.suggestedColumnSpacing.unit}`],
                ["Rationale", study.suggestedColumnSpacing.rationale],
              ]}
            />
          </ReportSection>

          <ReportSection number="4" title="Preliminary Beam Dimensions">
            <DataTable
              rows={[
                ["Main Beams", study.preliminaryBeamDimensions.mainBeam],
                ["Secondary Beams", study.preliminaryBeamDimensions.secondaryBeam],
                ["Depth Ratio", study.preliminaryBeamDimensions.depthRatio],
                ["Notes", study.preliminaryBeamDimensions.notes],
              ]}
            />
          </ReportSection>

          <ReportSection number="5" title="Preliminary Slab Thickness">
            <DataTable
              rows={[
                ["Slab Type", study.preliminarySlabThickness.type],
                [
                  "Thickness",
                  `${(study.preliminarySlabThickness.thickness * 1000).toFixed(0)} mm`,
                ],
                ["Notes", study.preliminarySlabThickness.notes],
              ]}
            />
          </ReportSection>

          <ReportSection number="6" title="Foundation Recommendation">
            <DataTable
              rows={[
                ["Foundation Type", study.foundationRecommendation.type],
                ["Minimum Depth", study.foundationRecommendation.depth],
                ["Bearing Capacity", study.foundationRecommendation.bearingCapacity],
                ["Details", study.foundationRecommendation.details],
              ]}
            />
          </ReportSection>

          <ReportSection number="7" title="Engineering Observations">
            <BulletList items={study.engineeringObservations} />
          </ReportSection>

          <ReportSection number="8" title="Risk Warnings">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <BulletList items={study.riskWarnings} variant="warning" />
            </div>
          </ReportSection>

          <ReportSection number="9" title="Technical Notes">
            <BulletList items={study.technicalNotes} />
          </ReportSection>
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}
