"use client";

import type { AIStudyInput, AIStudyReport } from "@/types";

function mm(value: number): number {
  return value;
}

export async function exportAIStudyToPdf(input: AIStudyInput, report: AIStudyReport): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = margin;

  const blue: [number, number, number] = [15, 76, 129];
  const slate: [number, number, number] = [51, 65, 85];
  const warn: [number, number, number] = [180, 50, 50];

  function newPageIfNeeded(extraHeight: number) {
    if (y + extraHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function titleBar(text: string) {
    newPageIfNeeded(14);
    doc.setFillColor(...blue);
    doc.rect(margin, y, pageWidth - margin * 2, 9, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(text, margin + 3, y + 6);
    doc.setTextColor(...slate);
    y += 12;
  }

  function paragraph(text: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    newPageIfNeeded(lines.length * 5 + 4);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 4;
  }

  function bulletList(items: string[], color: "normal" | "warning" = "normal") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...(color === "warning" ? warn : slate));
    for (const item of items) {
      const lines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2);
      newPageIfNeeded(lines.length * 5 + 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 2;
    }
    doc.setTextColor(...slate);
    y += 2;
  }

  function table(head: string[], body: Array<string[]>) {
    newPageIfNeeded(20);
    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: blue, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      theme: "grid",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  function drawGridDiagram() {
    const { landLength, landWidth, columnsX, columnsY, spacingX, spacingY } = report.visualStructuralGrid;
    const boxW = pageWidth - margin * 2;
    const maxH = 70;
    const aspect = landLength / landWidth;
    let drawW = boxW;
    let drawH = drawW / aspect;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * aspect;
    }
    const x0 = margin + (boxW - drawW) / 2;
    const y0 = y;

    newPageIfNeeded(drawH + 22);

    // Site boundary
    doc.setDrawColor(...blue);
    doc.setFillColor(239, 246, 255);
    doc.rect(x0, y0, drawW, drawH, "FD");

    // Grid lines
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.2);
    for (let ix = 0; ix < columnsX; ix++) {
      const xPos = ix === 0 ? 0 : ix === columnsX - 1 ? landLength : ix * spacingX;
      const x = x0 + (xPos / landLength) * drawW;
      doc.line(x, y0, x, y0 + drawH);
    }
    for (let iy = 0; iy < columnsY; iy++) {
      const yPos = iy === 0 ? 0 : iy === columnsY - 1 ? landWidth : iy * spacingY;
      const yy = y0 + (yPos / landWidth) * drawH;
      doc.line(x0, yy, x0 + drawW, yy);
    }

    // Columns
    for (let ix = 0; ix < columnsX; ix++) {
      for (let iy = 0; iy < columnsY; iy++) {
        const xPos = ix === 0 ? 0 : ix === columnsX - 1 ? landLength : ix * spacingX;
        const yPos = iy === 0 ? 0 : iy === columnsY - 1 ? landWidth : iy * spacingY;
        const cx = x0 + (xPos / landLength) * drawW;
        const cy = y0 + (yPos / landWidth) * drawH;

        const isCorner = (ix === 0 || ix === columnsX - 1) && (iy === 0 || iy === columnsY - 1);
        const isEdge = !isCorner && (ix === 0 || ix === columnsX - 1 || iy === 0 || iy === columnsY - 1);

        const fill = isCorner ? [29, 78, 216] : isEdge ? [59, 130, 246] : [147, 197, 253];
        doc.setFillColor(fill[0], fill[1], fill[2]);
        doc.setDrawColor(30, 58, 138);
        doc.rect(cx - 1.6, cy - 1.6, 3.2, 3.2, "FD");
      }
    }

    doc.setTextColor(...slate);
    doc.setFontSize(9);
    doc.text(
      `Grid: ${columnsX} × ${columnsY} | Spacing: ${spacingX.toFixed(2)} m × ${spacingY.toFixed(2)} m`,
      margin,
      y0 + drawH + 8,
    );
    doc.text(`Site: ${landLength.toFixed(1)} m × ${landWidth.toFixed(1)} m`, margin, y0 + drawH + 14);

    y = y0 + drawH + 20;
  }

  // Cover header
  doc.setFillColor(...blue);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CivilAI", margin, 14);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("AI Engineering Study — Preliminary Report", margin, 22);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, pageWidth - margin, 22, {
    align: "right",
  });

  y = 38;
  doc.setTextColor(...slate);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${input.buildingType} | ${input.numberOfFloors} Floors`, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Footprint: ${input.landLength} m × ${input.landWidth} m | Concrete ${input.concreteStrength} | Steel ${input.steelGrade} | ${input.seismicZone}`,
    margin,
    y,
  );
  y += 10;

  titleBar("1. Building Summary");
  table(["Parameter", "Value"], [
    ["Building type", report.buildingSummary.buildingType],
    ["Number of floors", String(report.buildingSummary.numberOfFloors)],
    ["Total area", `${report.buildingSummary.totalArea.toFixed(0)} ${report.buildingSummary.unit}`],
    ["Footprint", report.buildingSummary.footprint],
  ]);
  paragraph(report.buildingSummary.notes);

  titleBar("2. Preliminary Column Layout");
  table(["Parameter", "Value"], [
    ["Suggested number of columns", String(report.preliminaryColumnLayout.suggestedNumberOfColumns)],
    ["Suggested spacing X", `${report.preliminaryColumnLayout.suggestedSpacing.spacingX.toFixed(2)} m`],
    ["Suggested spacing Y", `${report.preliminaryColumnLayout.suggestedSpacing.spacingY.toFixed(2)} m`],
    ["Interior column size", report.preliminaryColumnLayout.columnSizes.interior],
    ["Edge column size", report.preliminaryColumnLayout.columnSizes.edge],
    ["Corner column size", report.preliminaryColumnLayout.columnSizes.corner],
  ]);
  paragraph(report.preliminaryColumnLayout.notes);

  titleBar("2B. Column Coordinates");
  table(
    ["ID", "Type", "X (m)", "Y (m)"],
    report.columnGridCalculation.coordinates.map((c) => [
      c.label,
      c.type,
      c.x.toFixed(2),
      c.y.toFixed(2),
    ]),
  );

  titleBar("3. Slab Recommendation");
  table(["Parameter", "Value"], [
    ["Slab type", report.slabRecommendation.type],
    ["Suggested thickness", `${(report.slabRecommendation.thickness * 1000).toFixed(0)} mm`],
  ]);
  paragraph(report.slabRecommendation.notes);

  titleBar("4. Beam Recommendation");
  table(["Parameter", "Value"], [
    ["Main beams", report.beamRecommendation.mainBeam],
    ["Secondary beams", report.beamRecommendation.secondaryBeam],
    ["Depth ratio", report.beamRecommendation.depthRatio],
  ]);
  paragraph(report.beamRecommendation.notes);

  titleBar("5. Foundation Recommendation");
  table(["Parameter", "Value"], [
    ["Foundation type", report.foundationRecommendation.type],
    ["Minimum depth", report.foundationRecommendation.depth],
    ["Bearing capacity", report.foundationRecommendation.bearingCapacity],
  ]);
  paragraph(report.foundationRecommendation.details);

  titleBar("6. Seismic Notes");
  bulletList(report.seismicNotes);

  titleBar("7. Material Recommendations");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Concrete", margin, y);
  y += 6;
  bulletList(report.materialRecommendations.concrete);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Steel", margin, y);
  y += 6;
  bulletList(report.materialRecommendations.steel);

  titleBar("8. Engineering Warnings");
  bulletList(report.engineeringWarnings, "warning");

  titleBar("8B. Engineering Report Score");
  table(["Parameter", "Value"], [
    ["Structural complexity", report.engineeringReportScore.level],
    ["Score (0–100)", String(report.engineeringReportScore.score)],
    ["Key drivers", report.engineeringReportScore.drivers.join("; ") || "-"],
  ]);

  titleBar("8C. Cost Estimation (Rough)");
  table(["Parameter", "Value"], [
    ["Estimated concrete volume", `${report.costEstimation.concreteVolumeM3.toFixed(0)} m³`],
    ["Estimated steel quantity", `${report.costEstimation.steelQuantityTonnes.toFixed(1)} t`],
    ["Steel rate assumption", `${report.costEstimation.steelRateKgPerM3} kg/m³ concrete`],
  ]);
  bulletList(report.costEstimation.assumptions);

  titleBar("9. Visual Structural Grid");
  drawGridDiagram();

  titleBar("10. Engineering Observations");
  bulletList(report.engineeringObservations);

  // Disclaimer footer (last page)
  newPageIfNeeded(22);
  doc.setFillColor(255, 243, 205);
  doc.setDrawColor(255, 193, 7);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, "FD");
  doc.setTextColor(120, 80, 0);
  doc.setFontSize(8.5);
  const disclaimer =
    "DISCLAIMER: These results are preliminary engineering recommendations and must be reviewed and approved by a licensed structural engineer.";
  const lines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2 - 6);
  doc.text(lines, margin + 3, y + 8);

  const filename = `AI_Engineering_Study_${input.buildingType.replace(/[^a-z0-9]/gi, "_")}_${new Date(report.generatedAt).toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

