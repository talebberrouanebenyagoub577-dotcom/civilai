"use client";

import { Download, FileText } from "lucide-react";
import { ColumnGridDiagram } from "@/components/diagrams/ColumnGridDiagram";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { exportAIStudyToPdf } from "@/lib/pdf/exportAIStudy";
import { formatDateTime } from "@/lib/utils/project";
import type { AIStudyInput, AIStudyReport } from "@/types";

interface AIStudyReportViewProps {
  input: AIStudyInput;
  report: AIStudyReport;
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
          <span
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
              variant === "warning" ? "bg-red-500" : "bg-blue-500"
            }`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function AIStudyReportView({ input, report }: AIStudyReportViewProps) {
  const title = `${input.buildingType} Building — ${input.numberOfFloors} Floors`;

  async function handleExportPdf() {
    await exportAIStudyToPdf(input, report);
  }

  return (
    <div id="ai-study-report" className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-6 w-6 shrink-0 text-blue-200" />
              <div>
                <p className="text-sm font-medium text-blue-200">AI Engineering Study</p>
                <h2 className="mt-1 text-2xl font-bold">{title}</h2>
                <p className="mt-2 text-blue-100">
                  {input.landLength} m × {input.landWidth} m · {input.concreteStrength} · Steel{" "}
                  {input.steelGrade} · {input.seismicZone}
                </p>
                <p className="mt-3 text-xs text-blue-300">
                  Generated: {formatDateTime(report.generatedAt)}
                </p>
              </div>
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
        </div>

        <div className="space-y-8 p-6 lg:p-8">
          <ReportSection number="1" title="Building Summary">
            <DataTable
              rows={[
                ["Building Type", report.buildingSummary.buildingType],
                ["Number of Floors", String(report.buildingSummary.numberOfFloors)],
                [
                  "Total Area",
                  `${report.buildingSummary.totalArea.toFixed(0)} ${report.buildingSummary.unit}`,
                ],
                ["Footprint", report.buildingSummary.footprint],
                ["Notes", report.buildingSummary.notes],
              ]}
            />
          </ReportSection>

          <ReportSection number="2" title="Column Grid Calculation">
            <div className="space-y-4">
              <DataTable
                rows={[
                  ["Columns (X direction)", String(report.columnGridCalculation.columnsX)],
                  ["Columns (Y direction)", String(report.columnGridCalculation.columnsY)],
                  ["Total Columns", String(report.columnGridCalculation.totalColumns)],
                  [
                    "Spacing X",
                    `${report.columnGridCalculation.spacingX.toFixed(2)} ${report.columnGridCalculation.unit}`,
                  ],
                  [
                    "Spacing Y",
                    `${report.columnGridCalculation.spacingY.toFixed(2)} ${report.columnGridCalculation.unit}`,
                  ],
                  ["Notes", report.columnGridCalculation.residualNotes],
                ]}
              />

              <ColumnGridDiagram
                landLength={report.visualStructuralGrid.landLength}
                landWidth={report.visualStructuralGrid.landWidth}
                columnsX={report.visualStructuralGrid.columnsX}
                columnsY={report.visualStructuralGrid.columnsY}
                spacingX={report.visualStructuralGrid.spacingX}
                spacingY={report.visualStructuralGrid.spacingY}
                showCoordinates
                coordinates={report.columnGridCalculation.coordinates}
              />

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                  <p className="text-sm font-semibold text-slate-900">Column Coordinates (m)</p>
                  <p className="text-xs text-slate-500">
                    Origin at (0,0). X along land length, Y along land width.
                  </p>
                </div>
                <div className="max-h-80 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">X (m)</th>
                        <th className="px-4 py-2">Y (m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.columnGridCalculation.coordinates.map((c) => (
                        <tr key={c.label} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-2 font-medium text-slate-900">{c.label}</td>
                          <td className="px-4 py-2 text-slate-600">{c.type}</td>
                          <td className="px-4 py-2 text-slate-700">{c.x.toFixed(2)}</td>
                          <td className="px-4 py-2 text-slate-700">{c.y.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ReportSection>

          <ReportSection number="3" title="Suggested Structural Grid">
            <DataTable
              rows={[
                ["Grid Type", report.suggestedStructuralGrid.gridType],
                ["Columns (X direction)", String(report.suggestedStructuralGrid.columnsX)],
                ["Columns (Y direction)", String(report.suggestedStructuralGrid.columnsY)],
                ["Total Columns", String(report.suggestedStructuralGrid.totalColumns)],
                ["Description", report.suggestedStructuralGrid.description],
              ]}
            />
          </ReportSection>

          <ReportSection number="4" title="Structural Recommendations">
            <div className="space-y-4">
              <DataTable
                rows={[
                  ["Suggested number of columns", String(report.preliminaryColumnLayout.suggestedNumberOfColumns)],
                  [
                    "Suggested spacing (X)",
                    `${report.preliminaryColumnLayout.suggestedSpacing.spacingX.toFixed(2)} ${report.preliminaryColumnLayout.suggestedSpacing.unit}`,
                  ],
                  [
                    "Suggested spacing (Y)",
                    `${report.preliminaryColumnLayout.suggestedSpacing.spacingY.toFixed(2)} ${report.preliminaryColumnLayout.suggestedSpacing.unit}`,
                  ],
                  ["Interior column size", report.preliminaryColumnLayout.columnSizes.interior],
                  ["Edge column size", report.preliminaryColumnLayout.columnSizes.edge],
                  ["Corner column size", report.preliminaryColumnLayout.columnSizes.corner],
                  ["Notes", report.preliminaryColumnLayout.notes],
                ]}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-900">Slab</p>
                  <DataTable
                    rows={[
                      ["Type", report.slabRecommendation.type],
                      ["Thickness", `${(report.slabRecommendation.thickness * 1000).toFixed(0)} mm`],
                      ["Notes", report.slabRecommendation.notes],
                    ]}
                  />
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-900">Beams</p>
                  <DataTable
                    rows={[
                      ["Main", report.beamRecommendation.mainBeam],
                      ["Secondary", report.beamRecommendation.secondaryBeam],
                      ["Depth ratio", report.beamRecommendation.depthRatio],
                      ["Notes", report.beamRecommendation.notes],
                    ]}
                  />
                </div>
              </div>
            </div>
          </ReportSection>

          <ReportSection number="5" title="Suggested Column Spacing">
            <DataTable
              rows={[
                [
                  "Spacing X",
                  `${report.suggestedColumnSpacing.spacingX} ${report.suggestedColumnSpacing.unit}`,
                ],
                [
                  "Spacing Y",
                  `${report.suggestedColumnSpacing.spacingY} ${report.suggestedColumnSpacing.unit}`,
                ],
                ["Rationale", report.suggestedColumnSpacing.rationale],
              ]}
            />
          </ReportSection>

          <ReportSection number="6" title="Foundation Logic">
            <DataTable
              rows={[
                ["Foundation Type", report.foundationRecommendation.type],
                ["Minimum Depth", report.foundationRecommendation.depth],
                ["Bearing Capacity", report.foundationRecommendation.bearingCapacity],
                ["Details", report.foundationRecommendation.details],
              ]}
            />
          </ReportSection>

          <ReportSection number="7" title="Seismic Logic">
            <BulletList items={report.seismicNotes} />
          </ReportSection>

          <ReportSection number="8" title="Material Logic">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-slate-900">Concrete</p>
                <BulletList items={report.materialRecommendations.concrete} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-slate-900">Steel</p>
                <BulletList items={report.materialRecommendations.steel} />
              </div>
            </div>
          </ReportSection>

          <ReportSection number="9" title="Engineering Report Score">
            <DataTable
              rows={[
                ["Structural complexity", report.engineeringReportScore.level],
                ["Score (0–100)", String(report.engineeringReportScore.score)],
                ["Key drivers", report.engineeringReportScore.drivers.join("; ") || "-"],
              ]}
            />
          </ReportSection>

          <ReportSection number="10" title="Cost Estimation (Rough)">
            <DataTable
              rows={[
                ["Estimated concrete volume", `${report.costEstimation.concreteVolumeM3.toFixed(0)} m³`],
                ["Estimated steel quantity", `${report.costEstimation.steelQuantityTonnes.toFixed(1)} t`],
                ["Steel rate assumption", `${report.costEstimation.steelRateKgPerM3} kg/m³ concrete`],
              ]}
            />
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">Assumptions</p>
              <BulletList items={report.costEstimation.assumptions} />
            </div>
          </ReportSection>

          <ReportSection number="11" title="Engineering Warnings">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <BulletList items={report.engineeringWarnings} variant="warning" />
            </div>
          </ReportSection>

          <ReportSection number="12" title="Engineering Observations">
            <BulletList items={report.engineeringObservations} />
          </ReportSection>
        </div>
      </Card>

      <Disclaimer />
    </div>
  );
}
