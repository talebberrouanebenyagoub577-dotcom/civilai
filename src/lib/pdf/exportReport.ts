import type { EngineeringStudy, ProjectInput } from "@/types";

interface PdfProjectMeta extends ProjectInput {
  id?: string;
  createdAt?: string;
}

export async function exportReportToPdf(
  project: PdfProjectMeta,
  study: EngineeringStudy,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = margin;

  const primaryBlue: [number, number, number] = [15, 76, 129];
  const lightGray: [number, number, number] = [100, 116, 139];

  function addSectionTitle(title: string) {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    doc.setFillColor(...primaryBlue);
    doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 3, y + 5.5);
    y += 12;
    doc.setTextColor(30, 41, 59);
  }

  function addParagraph(text: string, fontSize = 10) {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    if (y + lines.length * 5 > 285) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += lines.length * 5 + 4;
  }

  function addBulletList(items: string[]) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    items.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 4);
      if (y + lines.length * 5 > 285) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, margin + 2, y);
      y += lines.length * 5 + 2;
    });
    y += 4;
  }

  // Header
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("CivilAI", margin, 14);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Preliminary Structural Engineering Study", margin, 22);
  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date(study.generatedAt).toLocaleString()}`,
    pageWidth - margin,
    22,
    { align: "right" },
  );

  y = 42;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(project.projectName, margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightGray);
  doc.text(`${project.buildingType} | ${project.numberOfFloors} Floors | ${project.landLength}×${project.landWidth} m`, margin, y);
  y += 10;

  // Project parameters table
  autoTable(doc, {
    startY: y,
    head: [["Parameter", "Value"]],
    body: [
      ["Building Height", `${project.buildingHeight} m`],
      ["Soil Type", project.soilType],
      ["Concrete Strength", project.concreteStrength],
      ["Steel Grade", project.steelGrade],
      ["Seismic Zone", project.seismicZone],
      ["Wind Zone", project.windZone],
      ["Parking", project.hasParking ? "Yes" : "No"],
    ],
    margin: { left: margin, right: margin },
    headStyles: { fillColor: primaryBlue, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    theme: "grid",
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  addSectionTitle("1. Preliminary Structural Study");
  addParagraph(study.preliminaryStructuralStudy);

  addSectionTitle("2. Recommended Column Grid");
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Columns (X direction)", String(study.recommendedColumnGrid.columnsX)],
      ["Columns (Y direction)", String(study.recommendedColumnGrid.columnsY)],
      ["Total Columns", String(study.recommendedColumnGrid.totalColumns)],
      ["Description", study.recommendedColumnGrid.description],
    ],
    margin: { left: margin, right: margin },
    headStyles: { fillColor: primaryBlue, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    theme: "grid",
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  addSectionTitle("3. Suggested Column Spacing");
  autoTable(doc, {
    startY: y,
    body: [
      ["Spacing X", `${study.suggestedColumnSpacing.spacingX} ${study.suggestedColumnSpacing.unit}`],
      ["Spacing Y", `${study.suggestedColumnSpacing.spacingY} ${study.suggestedColumnSpacing.unit}`],
      ["Rationale", study.suggestedColumnSpacing.rationale],
    ],
    margin: { left: margin, right: margin },
    bodyStyles: { fontSize: 9 },
    theme: "grid",
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  addSectionTitle("4. Preliminary Beam Dimensions");
  autoTable(doc, {
    startY: y,
    body: [
      ["Main Beams", study.preliminaryBeamDimensions.mainBeam],
      ["Secondary Beams", study.preliminaryBeamDimensions.secondaryBeam],
      ["Depth Ratio", study.preliminaryBeamDimensions.depthRatio],
      ["Notes", study.preliminaryBeamDimensions.notes],
    ],
    margin: { left: margin, right: margin },
    bodyStyles: { fontSize: 9 },
    theme: "grid",
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  addSectionTitle("5. Preliminary Slab Thickness");
  addParagraph(
    `${study.preliminarySlabThickness.type}: ${(study.preliminarySlabThickness.thickness * 1000).toFixed(0)} mm. ${study.preliminarySlabThickness.notes}`,
  );

  addSectionTitle("6. Foundation Recommendation");
  autoTable(doc, {
    startY: y,
    body: [
      ["Type", study.foundationRecommendation.type],
      ["Depth", study.foundationRecommendation.depth],
      ["Bearing Capacity", study.foundationRecommendation.bearingCapacity],
      ["Details", study.foundationRecommendation.details],
    ],
    margin: { left: margin, right: margin },
    bodyStyles: { fontSize: 9 },
    theme: "grid",
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  addSectionTitle("7. Engineering Observations");
  addBulletList(study.engineeringObservations);

  addSectionTitle("8. Risk Warnings");
  doc.setTextColor(180, 50, 50);
  addBulletList(study.riskWarnings);
  doc.setTextColor(30, 41, 59);

  addSectionTitle("9. Technical Notes");
  addBulletList(study.technicalNotes);

  // Disclaimer footer
  if (y > 250) {
    doc.addPage();
    y = margin;
  }
  y = Math.max(y, 250);
  doc.setFillColor(255, 243, 205);
  doc.setDrawColor(255, 193, 7);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setTextColor(120, 80, 0);
  const disclaimer =
    "DISCLAIMER: These results are preliminary engineering recommendations and must be reviewed and approved by a licensed structural engineer.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2 - 6);
  doc.text(disclaimerLines, margin + 3, y + 8);

  const filename = `${project.projectName.replace(/[^a-z0-9]/gi, "_")}_Engineering_Study.pdf`;
  doc.save(filename);
}
