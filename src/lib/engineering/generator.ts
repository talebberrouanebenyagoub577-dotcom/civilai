import type { EngineeringStudy, ProjectInput } from "@/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function getTargetSpacing(buildingType: string): { min: number; max: number } {
  switch (buildingType) {
    case "Industrial":
      return { min: 7, max: 9 };
    case "Commercial":
    case "Mixed-Use":
      return { min: 6, max: 8 };
    case "Healthcare":
    case "Institutional":
      return { min: 5.5, max: 7 };
    default:
      return { min: 4.5, max: 6.5 };
  }
}

function getConcreteClass(strength: string): number {
  const match = strength.match(/C(\d+)/);
  return match ? parseInt(match[1], 10) : 25;
}

function getFoundationType(soilType: string, floors: number): string {
  if (soilType.includes("Rock") || soilType.includes("Hard")) {
    return floors <= 3 ? "Strip / Pad Footings on Rock" : "Reinforced Pad Footings";
  }
  if (soilType.includes("Dense Sand")) {
    return floors <= 4 ? "Isolated Pad Footings" : "Combined Pad Footings / Raft (partial)";
  }
  if (soilType.includes("Soft Clay") || soilType.includes("Fill")) {
    return floors <= 2 ? "Reinforced Raft Foundation" : "Deep Piles + Pile Cap / Raft";
  }
  if (soilType.includes("Loose Sand")) {
    return "Raft Foundation with Ground Improvement";
  }
  return floors <= 3 ? "Isolated Pad Footings" : "Raft Foundation";
}

function getBearingCapacity(soilType: string): string {
  const map: Record<string, string> = {
    "Rock / Hard Stratum": "800–1500 kPa (presumed, verify by geotechnical report)",
    "Dense Sand / Gravel": "250–400 kPa",
    "Medium Clay": "100–200 kPa",
    "Soft Clay": "50–100 kPa",
    "Loose Sand": "80–150 kPa",
    "Fill / Uncontrolled": "Requires investigation — assume 80 kPa until tested",
  };
  return map[soilType] ?? "150–250 kPa (site-specific verification required)";
}

function getFoundationDepth(soilType: string, floors: number): string {
  const baseDepth = soilType.includes("Soft") || soilType.includes("Fill") ? 2.0 : 1.2;
  const extra = Math.min(floors * 0.05, 0.8);
  return `${(baseDepth + extra).toFixed(1)} m below finished floor level (minimum)`;
}

function getSlabType(spacingX: number, spacingY: number): string {
  const ratio = Math.max(spacingX, spacingY) / Math.min(spacingX, spacingY);
  return ratio <= 1.5 ? "Two-way RC slab" : "One-way RC slab with secondary beams";
}

function getSeismicNotes(zone: string): string[] {
  const notes: Record<string, string[]> = {
    "Zone 0": ["Low seismic demand — standard ductile detailing recommended."],
    "Zone I": ["Moderate seismicity — apply basic ductile frame detailing."],
    "Zone II": ["Significant seismic action — special moment resisting frames or shear walls advised."],
    "Zone III": ["High seismic hazard — rigorous ductility class and drift control required."],
    "Zone IV": ["Very high seismic hazard — advanced analysis (response spectrum / time-history) recommended."],
  };
  return notes[zone] ?? ["Seismic design per applicable national code."];
}

function getWindNotes(zone: string, height: number): string[] {
  const base =
    zone === "Zone 4"
      ? ["High wind zone — increase design wind pressure and check cladding fixings."]
      : zone === "Zone 3"
        ? ["Moderate-high wind exposure — verify lateral load combinations."]
        : ["Standard wind load combinations per code."];

  if (height > 30) {
    base.push("Building height exceeds 30 m — consider dynamic wind effects and comfort criteria.");
  }
  return base;
}

export function generateEngineeringStudy(input: ProjectInput): EngineeringStudy {
  const { min, max } = getTargetSpacing(input.buildingType);
  const targetSpacing = (min + max) / 2;

  const columnsX = clamp(Math.round(input.landLength / targetSpacing) + 1, 2, 20);
  const columnsY = clamp(Math.round(input.landWidth / targetSpacing) + 1, 2, 20);
  const totalColumns = columnsX * columnsY;

  const spacingX = roundTo(input.landLength / (columnsX - 1), 0.25);
  const spacingY = roundTo(input.landWidth / (columnsY - 1), 0.25);
  const maxSpan = Math.max(spacingX, spacingY);

  const beamDepth = roundTo(maxSpan / 12, 0.05);
  const beamWidth = roundTo(Math.max(0.25, beamDepth * 0.45), 0.05);
  const secondarySpan = Math.min(spacingX, spacingY);
  const secondaryDepth = roundTo(secondarySpan / 15, 0.05);
  const secondaryWidth = roundTo(Math.max(0.2, secondaryDepth * 0.4), 0.05);

  const slabType = getSlabType(spacingX, spacingY);
  const slabThickness = roundTo(
    slabType.includes("Two-way") ? maxSpan / 35 : maxSpan / 30,
    0.01,
  );

  const concreteClass = getConcreteClass(input.concreteStrength);
  const estimatedFloorLoad = input.buildingType === "Industrial" ? 12 : input.buildingType === "Commercial" ? 8 : 5;
  const totalEstimatedLoad = estimatedFloorLoad * input.numberOfFloors;

  const foundationType = getFoundationType(input.soilType, input.numberOfFloors);
  const columnSize = input.numberOfFloors <= 3 ? "300×300 mm" : input.numberOfFloors <= 8 ? "400×400 mm" : "450×450 mm (minimum, verify by analysis)";

  const preliminaryStructuralStudy = [
    `Preliminary structural assessment for "${input.projectName}" — a ${input.numberOfFloors}-storey ${input.buildingType.toLowerCase()} building on a ${input.landLength.toFixed(1)} m × ${input.landWidth.toFixed(1)} m site.`,
    `Overall building height: ${input.buildingHeight.toFixed(1)} m. Gross floor area per level: approximately ${(input.landLength * input.landWidth).toFixed(0)} m².`,
    `Structural system recommendation: cast-in-place reinforced concrete frame with ${slabType.toLowerCase()} at typical floors.`,
    `Material specification: concrete ${input.concreteStrength}, reinforcing steel grade ${input.steelGrade}.`,
    `Estimated characteristic floor live load assumption: ${estimatedFloorLoad} kN/m² (preliminary — confirm per occupancy code).`,
    `Approximate cumulative gravity demand index: ${totalEstimatedLoad} kN/m² over ${input.numberOfFloors} floors (order-of-magnitude for scheme design).`,
    `Preliminary column size guidance: ${columnSize} for interior columns; increase at lower storeys and corners as required by analysis.`,
    input.hasParking
      ? "Parking provision noted — allow for transfer structure or ramp slab at ground/basement level with increased live load (≈ 2.5–5.0 kN/m²)."
      : "No on-site parking specified — typical ground floor slab-on-grade or suspended ground slab depending on soil conditions.",
  ].join(" ");

  const engineeringObservations = [
    `Regular column grid of ${columnsX} × ${columnsY} provides structural uniformity and efficient load paths.`,
    `Typical bay size ${spacingX.toFixed(2)} m × ${spacingY.toFixed(2)} m is within recommended range for ${input.buildingType.toLowerCase()} occupancy.`,
    `Slenderness check: approximate storey height ${(input.buildingHeight / input.numberOfFloors).toFixed(2)} m — verify second-order effects if exceeds code limits.`,
    `Concrete class ${input.concreteStrength} (fck ≈ ${concreteClass} MPa) is ${concreteClass >= 30 ? "adequate" : "minimum"} for medium-rise RC frames.`,
    input.hasParking
      ? "Ground floor transfer zone may require deeper beams (≥ 600 mm) or post-tensioned slab — detail at DD stage."
      : "Column layout allows flexible architectural planning with minimal transfer elements.",
  ];

  const riskWarnings = [
    ...getSeismicNotes(input.seismicZone),
    ...getWindNotes(input.windZone, input.buildingHeight),
  ];

  if (input.soilType.includes("Soft") || input.soilType.includes("Fill")) {
    riskWarnings.push(
      "Poor or uncontrolled soil conditions — mandatory geotechnical investigation before final foundation design.",
    );
  }

  if (input.numberOfFloors > 10 && input.concreteStrength === "C20/25") {
    riskWarnings.push("High-rise with low concrete grade — upgrade to C30/37 or higher recommended.");
  }

  if (maxSpan > 8) {
    riskWarnings.push(`Long span of ${maxSpan.toFixed(1)} m may require post-tensioned slabs or steel beams — verify deflection and vibration criteria.`);
  }

  const technicalNotes = [
    "All dimensions are preliminary and based on span/depth ratios commonly used in scheme design (ACI/Eurocode guidance).",
    "Final member sizes require structural analysis including load combinations, deflection, crack width, and fire resistance checks.",
    "Seismic and wind loads must be computed per the governing national annex and site-specific parameters.",
    "Soil bearing capacity values are indicative — geotechnical report required for foundation sign-off.",
    "Reinforcement quantities, connection details, and construction joints to be defined in detailed design phase.",
    "Coordinate with MEP disciplines for slab openings, heavy equipment loads, and setback requirements.",
  ];

  return {
    preliminaryStructuralStudy,
    recommendedColumnGrid: {
      columnsX,
      columnsY,
      totalColumns,
      description: `${columnsX} columns along the ${input.landLength.toFixed(1)} m direction × ${columnsY} columns along the ${input.landWidth.toFixed(1)} m direction (${totalColumns} columns total at typical floor).`,
    },
    suggestedColumnSpacing: {
      spacingX,
      spacingY,
      unit: "m",
      rationale: `Target spacing derived from ${input.buildingType} occupancy guidelines (${min}–${max} m). Actual spacing: ${spacingX.toFixed(2)} m × ${spacingY.toFixed(2)} m.`,
    },
    preliminaryBeamDimensions: {
      mainBeam: `${(beamWidth * 1000).toFixed(0)} mm × ${(beamDepth * 1000).toFixed(0)} mm (b × h)`,
      secondaryBeam: `${(secondaryWidth * 1000).toFixed(0)} mm × ${(secondaryDepth * 1000).toFixed(0)} mm (b × h)`,
      depthRatio: `Main span L/${Math.round(maxSpan / beamDepth)} — secondary span L/${Math.round(secondarySpan / secondaryDepth)}`,
      notes: "Increase depth at perimeter and transfer beams. Verify shear and deflection under factored loads.",
    },
    preliminarySlabThickness: {
      thickness: slabThickness,
      unit: "m",
      type: slabType,
      notes: `Minimum recommended thickness ${(slabThickness * 1000).toFixed(0)} mm for ${maxSpan.toFixed(1)} m maximum span. Add 20–30 mm for finishes and services zone if needed.`,
    },
    foundationRecommendation: {
      type: foundationType,
      depth: getFoundationDepth(input.soilType, input.numberOfFloors),
      bearingCapacity: getBearingCapacity(input.soilType),
      details: `Based on ${input.soilType} and ${input.numberOfFloors} floors. ${input.seismicZone !== "Zone 0" ? "Provide tie beams and adequate anchorage for seismic load path continuity." : "Standard footing reinforcement and minimum cover per code."}`,
    },
    engineeringObservations,
    riskWarnings,
    technicalNotes,
    generatedAt: new Date().toISOString(),
  };
}
