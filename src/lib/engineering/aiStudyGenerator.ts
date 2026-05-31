import type { AIStudyInput, AIStudyReport } from "@/types";

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

function getColumnSizes(floors: number): {
  interior: string;
  corner: string;
  edge: string;
} {
  if (floors <= 3) {
    return { interior: "300 × 300 mm", corner: "350 × 350 mm", edge: "300 × 350 mm" };
  }
  if (floors <= 8) {
    return { interior: "400 × 400 mm", corner: "450 × 450 mm", edge: "400 × 450 mm" };
  }
  return {
    interior: "450 × 450 mm",
    corner: "500 × 500 mm",
    edge: "450 × 500 mm",
  };
}

function getConcreteComments(concreteStrength: string, floors: number): string[] {
  const fck = getConcreteClass(concreteStrength);
  const comments: string[] = [];

  comments.push(`Concrete class ${concreteStrength} (fck ≈ ${fck} MPa) selected for structural elements.`);

  if (fck < 25) {
    comments.push("Concrete strength is below typical minimum for structural frames — upgrade recommended.");
  } else if (fck < 30) {
    comments.push("Concrete strength is at the lower end for multi-storey RC frames — verify durability and fire requirements.");
  } else if (fck <= 40) {
    comments.push("Concrete strength is suitable for typical mid-rise RC frames; verify mix design for site conditions.");
  } else {
    comments.push("High-strength concrete selected — ensure appropriate curing control and quality assurance.");
  }

  if (floors >= 10 && fck < 30) {
    comments.push("For 10+ storeys, consider C30/37 or higher to control column sizes and long-term deflection.");
  }

  comments.push("Confirm exposure class, cover requirements, and durability design in detailed stage.");
  return comments;
}

function getSteelComments(steelGrade: string, seismicZone: string): string[] {
  const comments: string[] = [];
  comments.push(`Reinforcing steel grade ${steelGrade} specified for longitudinal and transverse reinforcement.`);

  if (steelGrade.includes("B400")) {
    comments.push("Lower strength steel implies increased reinforcement ratios — confirm constructability and bar congestion.");
  } else if (steelGrade.includes("B500")) {
    comments.push("B500 is widely used for RC frames; ensure ductility class appropriate for seismic detailing.");
  } else {
    comments.push("Higher strength steel selected — confirm ductility and weldability per standard.");
  }

  if (seismicZone !== "Zone 0") {
    comments.push("In seismic zones, verify steel ductility class, confinement reinforcement, and lap splice restrictions per code.");
  }

  comments.push("Confirm rebar availability, bend diameters, and anchorage detailing during detailed design.");
  return comments;
}

function computeBeamSizes(spacingX: number, spacingY: number): {
  mainBeam: string;
  secondaryBeam: string;
  depthRatio: string;
  notes: string;
} {
  const maxSpan = Math.max(spacingX, spacingY);
  const minSpan = Math.min(spacingX, spacingY);

  const mainDepthM = roundTo(maxSpan / 12, 0.05);
  const mainWidthM = roundTo(Math.max(0.25, mainDepthM * 0.45), 0.05);

  const secDepthM = roundTo(minSpan / 15, 0.05);
  const secWidthM = roundTo(Math.max(0.20, secDepthM * 0.4), 0.05);

  const main = `${(mainWidthM * 1000).toFixed(0)} mm × ${(mainDepthM * 1000).toFixed(0)} mm (b × h)`;
  const secondary = `${(secWidthM * 1000).toFixed(0)} mm × ${(secDepthM * 1000).toFixed(0)} mm (b × h)`;

  return {
    mainBeam: main,
    secondaryBeam: secondary,
    depthRatio: `Main span L/${Math.max(8, Math.round(maxSpan / mainDepthM))} — secondary span L/${Math.max(10, Math.round(minSpan / secDepthM))}`,
    notes:
      maxSpan > 8
        ? "Long span bays may require deeper beams, drop panels, or post-tensioning — verify deflection, vibration, and cracking."
        : "Increase depths at perimeter/transfer zones and check shear, deflection, and fire rating in detailed design.",
  };
}

function computeEngineeringWarnings(args: {
  floors: number;
  soilType: string;
  seismicZone: string;
  spacingMax: number;
  concreteStrength: string;
  columnsX: number;
  columnsY: number;
}): string[] {
  const warnings: string[] = [];
  const fck = getConcreteClass(args.concreteStrength);

  warnings.push("All member sizes are preliminary and require full structural analysis and code checks before construction.");
  warnings.push("Verify load cases and combinations: dead, live, wind, seismic, construction loads, and accidental actions.");

  if (args.seismicZone !== "Zone 0") {
    warnings.push("Seismic design requires drift checks, capacity design, and ductile detailing per the governing seismic code.");
  }

  if (args.floors >= 8) {
    warnings.push("For 8+ storeys, include second-order (P-Δ) effects and frame stability checks.");
  }

  if (args.spacingMax > 8) {
    warnings.push("Bay span exceeds typical RC limits — slab deflection and vibration require detailed verification.");
  }

  if (args.soilType.includes("Fill") || args.soilType.includes("Soft")) {
    warnings.push("Ground conditions may be weak/compressible — geotechnical report is mandatory and settlement checks are critical.");
  }

  if (args.floors >= 12) {
    warnings.push("High-rise behaviour: consider lateral system selection (shear walls/core), wind comfort, and dynamic effects.");
  }

  if (fck < 30 && args.floors >= 10) {
    warnings.push("Concrete grade may be insufficient for the building height — consider upgrading to reduce column sizes and creep effects.");
  }

  if ((args.columnsX < 3 || args.columnsY < 3) && args.floors >= 5) {
    warnings.push("Sparse grid for multi-storey structure may lead to long spans/transfer elements — review architectural layout and grid density.");
  }

  warnings.push("Confirm fire resistance, durability exposure, and service penetrations (MEP openings) during detailed design.");
  return warnings;
}

function columnLabel(ix: number, iy: number): string {
  // A1, A2... then B1, B2...
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters[ix] ?? `X${ix + 1}`;
  return `${letter}${iy + 1}`;
}

function classifyColumn(ix: number, iy: number, columnsX: number, columnsY: number): "corner" | "edge" | "interior" {
  const isCorner = (ix === 0 || ix === columnsX - 1) && (iy === 0 || iy === columnsY - 1);
  if (isCorner) return "corner";
  const isEdge = ix === 0 || ix === columnsX - 1 || iy === 0 || iy === columnsY - 1;
  return isEdge ? "edge" : "interior";
}

function buildCoordinates(params: {
  landLength: number;
  landWidth: number;
  columnsX: number;
  columnsY: number;
  spacingX: number;
  spacingY: number;
}): Array<{ label: string; x: number; y: number; unit: string; type: "corner" | "edge" | "interior" }> {
  const coords: Array<{ label: string; x: number; y: number; unit: string; type: "corner" | "edge" | "interior" }> = [];
  for (let ix = 0; ix < params.columnsX; ix++) {
    for (let iy = 0; iy < params.columnsY; iy++) {
      const x = ix === 0 ? 0 : ix === params.columnsX - 1 ? params.landLength : ix * params.spacingX;
      const y = iy === 0 ? 0 : iy === params.columnsY - 1 ? params.landWidth : iy * params.spacingY;
      coords.push({
        label: columnLabel(ix, iy),
        x: roundTo(x, 0.01),
        y: roundTo(y, 0.01),
        unit: "m",
        type: classifyColumn(ix, iy, params.columnsX, params.columnsY),
      });
    }
  }
  return coords;
}

function computeComplexityScore(args: {
  floors: number;
  seismicZone: string;
  soilType: string;
  maxSpan: number;
  totalArea: number;
}): { level: "Low" | "Medium" | "High"; score: number; drivers: string[] } {
  let score = 0;
  const drivers: string[] = [];

  // Floors
  if (args.floors <= 3) {
    score += 10;
  } else if (args.floors <= 8) {
    score += 30;
    drivers.push("Mid-rise (4–8 storeys)");
  } else {
    score += 55;
    drivers.push("High-rise (9+ storeys)");
  }

  // Seismic
  const seismicMap: Record<string, number> = { "Zone 0": 0, "Zone I": 10, "Zone II": 20, "Zone III": 30, "Zone IV": 40 };
  const s = seismicMap[args.seismicZone] ?? 20;
  score += s;
  if (s >= 20) drivers.push(`Seismic demand (${args.seismicZone})`);

  // Soil
  if (args.soilType.includes("Soft") || args.soilType.includes("Fill")) {
    score += 25;
    drivers.push("Challenging soil (soft/fill)");
  } else if (args.soilType.includes("Loose")) {
    score += 15;
    drivers.push("Loose soil");
  } else {
    score += 5;
  }

  // Span
  if (args.maxSpan > 8) {
    score += 20;
    drivers.push(`Long spans (max ${args.maxSpan.toFixed(1)} m)`);
  } else if (args.maxSpan > 6) {
    score += 10;
    drivers.push(`Moderate spans (max ${args.maxSpan.toFixed(1)} m)`);
  }

  // Area
  if (args.totalArea > 15000) {
    score += 10;
    drivers.push("Large total area");
  }

  score = clamp(score, 0, 100);
  const level = score < 35 ? "Low" : score < 70 ? "Medium" : "High";
  return { level, score, drivers };
}

function estimateQuantities(args: {
  landLength: number;
  landWidth: number;
  floors: number;
  slabThicknessM: number;
  columnsX: number;
  columnsY: number;
  estimatedHeightM: number;
  soilType: string;
  complexity: "Low" | "Medium" | "High";
}): { concreteVolumeM3: number; steelQuantityTonnes: number; steelRateKgPerM3: number; assumptions: string[] } {
  const footprint = args.landLength * args.landWidth;
  const totalArea = footprint * args.floors;

  // Slab volume
  const slabVol = totalArea * args.slabThicknessM;

  // Column volume (very rough)
  const storeyH = args.estimatedHeightM / args.floors;
  const totalColumns = args.columnsX * args.columnsY;
  const avgColumnArea =
    args.complexity === "Low" ? 0.14 : args.complexity === "Medium" ? 0.18 : 0.22; // m²
  const columnVol = totalColumns * args.floors * storeyH * avgColumnArea;

  // Beam volume (rough)
  const beamFactor = args.complexity === "Low" ? 0.035 : args.complexity === "Medium" ? 0.05 : 0.065; // m³ per m²
  const beamVol = totalArea * beamFactor;

  // Foundation volume (rough)
  let foundationFactor = 0.08;
  if (args.soilType.includes("Soft") || args.soilType.includes("Fill")) foundationFactor = 0.14;
  else if (args.soilType.includes("Loose")) foundationFactor = 0.11;
  else if (args.soilType.includes("Rock")) foundationFactor = 0.06;
  const foundationVol = footprint * foundationFactor;

  const concreteVolumeM3 = slabVol + columnVol + beamVol + foundationVol;

  // Steel rate (kg/m³ of concrete), rough range depending on complexity & seismic
  const steelRateKgPerM3 =
    args.complexity === "Low" ? 95 : args.complexity === "Medium" ? 120 : 150;
  const steelQuantityTonnes = (concreteVolumeM3 * steelRateKgPerM3) / 1000;

  const assumptions = [
    "Quantities are rough order-of-magnitude for feasibility only.",
    `Slab volume = total floor area × slab thickness (${(args.slabThicknessM * 1000).toFixed(0)} mm).`,
    `Columns modelled using average column area ≈ ${avgColumnArea.toFixed(2)} m² and storey height ≈ ${storeyH.toFixed(2)} m.`,
    `Beams modelled using beam volume factor ≈ ${(beamFactor * 1000).toFixed(0)} L/m² of floor area.`,
    `Foundation volume factor depends on soil type (${foundationFactor.toFixed(2)} m³/m² of footprint).`,
    `Steel rate assumed ≈ ${steelRateKgPerM3} kg/m³ of concrete (varies strongly with seismic detailing and spans).`,
  ];

  return {
    concreteVolumeM3,
    steelQuantityTonnes,
    steelRateKgPerM3,
    assumptions,
  };
}

export function generateAIStudyReport(input: AIStudyInput): AIStudyReport {
  const { min, max } = getTargetSpacing(input.buildingType);
  const targetSpacing = (min + max) / 2;

  const columnsX = clamp(Math.round(input.landLength / targetSpacing) + 1, 2, 20);
  const columnsY = clamp(Math.round(input.landWidth / targetSpacing) + 1, 2, 20);
  const totalColumns = columnsX * columnsY;

  const spacingX = roundTo(input.landLength / (columnsX - 1), 0.25);
  const spacingY = roundTo(input.landWidth / (columnsY - 1), 0.25);
  const maxSpan = Math.max(spacingX, spacingY);

  const slabType = getSlabType(spacingX, spacingY);
  const slabThickness = roundTo(
    slabType.includes("Two-way") ? maxSpan / 35 : maxSpan / 30,
    0.01,
  );

  const concreteClass = getConcreteClass(input.concreteStrength);
  const estimatedFloorLoad =
    input.buildingType === "Industrial" ? 12 : input.buildingType === "Commercial" ? 8 : 5;
  const grossFloorArea = input.landLength * input.landWidth;
  const estimatedHeight = input.numberOfFloors * 3.5;
  const columnSizes = getColumnSizes(input.numberOfFloors);
  const foundationType = getFoundationType(input.soilType, input.numberOfFloors);

  const cornerCount = columnsX >= 2 && columnsY >= 2 ? 4 : totalColumns;
  const edgeCount = Math.max(0, 2 * (columnsX + columnsY) - 4 - cornerCount);
  const interiorCount = Math.max(0, totalColumns - cornerCount - edgeCount);

  const engineeringObservations = [
    `Regular orthogonal grid (${columnsX} × ${columnsY}) provides uniform load distribution and simplifies formwork and reinforcement detailing.`,
    `Typical bay dimensions of ${spacingX.toFixed(2)} m × ${spacingY.toFixed(2)} m fall within the ${min}–${max} m guidance range for ${input.buildingType.toLowerCase()} buildings.`,
    `Interior columns (${columnSizes.interior}) may be reduced at upper storeys subject to tributary area reduction — verify by analysis.`,
    `Corner columns (${columnSizes.corner}) attract biaxial bending from frame action — provide adequate confinement reinforcement in seismic zones.`,
    `Concrete class ${input.concreteStrength} is ${concreteClass >= 30 ? "suitable" : "at the minimum threshold"} for a ${input.numberOfFloors}-storey RC frame — consider upgrade if durability or fire rating demands.`,
    `Slab system (${slabType}) with ${(slabThickness * 1000).toFixed(0)} mm thickness aligns with span/depth ratios for preliminary scheme design.`,
  ];

  const seismicNotes = getSeismicNotes(input.seismicZone);
  const beam = computeBeamSizes(spacingX, spacingY);
  const materialRecommendations = {
    concrete: getConcreteComments(input.concreteStrength, input.numberOfFloors),
    steel: getSteelComments(input.steelGrade, input.seismicZone),
  };
  const complexity = computeComplexityScore({
    floors: input.numberOfFloors,
    seismicZone: input.seismicZone,
    soilType: input.soilType,
    maxSpan,
    totalArea: grossFloorArea * input.numberOfFloors,
  });
  const quantities = estimateQuantities({
    landLength: input.landLength,
    landWidth: input.landWidth,
    floors: input.numberOfFloors,
    slabThicknessM: slabThickness,
    columnsX,
    columnsY,
    estimatedHeightM: estimatedHeight,
    soilType: input.soilType,
    complexity: complexity.level,
  });

  const engineeringWarnings = computeEngineeringWarnings({
    floors: input.numberOfFloors,
    soilType: input.soilType,
    seismicZone: input.seismicZone,
    spacingMax: maxSpan,
    concreteStrength: input.concreteStrength,
    columnsX,
    columnsY,
  });

  if (input.soilType.includes("Soft") || input.soilType.includes("Fill")) {
    engineeringObservations.push(
      "Soil condition indicates potential compressibility — consider raft foundation or deep foundations subject to investigation.",
    );
  }

  if (input.numberOfFloors > 10 && input.concreteStrength === "C20/25") {
    engineeringObservations.push(
      "For 10+ storeys, upgrading concrete strength can reduce column sizes and improve stiffness (creep/deflection control).",
    );
  }

  if (maxSpan > 8) {
    engineeringObservations.push(
      `Long bay span detected (${maxSpan.toFixed(1)} m) — consider beams/secondary framing or post-tensioning at feasibility stage.`,
    );
  }

  if (input.numberOfFloors > 12) {
    engineeringObservations.push(
      "High-rise behaviour expected — review lateral system options (RC core/shear walls) and perform preliminary drift checks.",
    );
  }

  return {
    buildingSummary: {
      buildingType: input.buildingType,
      numberOfFloors: input.numberOfFloors,
      totalArea: grossFloorArea * input.numberOfFloors,
      unit: "m²",
      footprint: `${input.landLength.toFixed(1)} m × ${input.landWidth.toFixed(1)} m`,
      notes: `Estimated height ≈ ${estimatedHeight.toFixed(1)} m (assumed 3.5 m typical storey height). Preliminary live load assumption: ${estimatedFloorLoad} kN/m² (confirm per code).`,
    },
    columnGridCalculation: {
      columnsX,
      columnsY,
      totalColumns,
      spacingX,
      spacingY,
      unit: "m",
      residualNotes:
        `Grid spacing is rounded to 0.25 m increments. End bays align to the site boundary; intermediate lines follow rounded spacing. ` +
        `If architectural constraints demand exact bay sizes, adjust column line positions and re-check spans.`,
      coordinates: buildCoordinates({
        landLength: input.landLength,
        landWidth: input.landWidth,
        columnsX,
        columnsY,
        spacingX,
        spacingY,
      }),
    },
    suggestedStructuralGrid: {
      columnsX,
      columnsY,
      totalColumns,
      gridType: "Orthogonal RC column grid",
      description: `${columnsX} column lines along the ${input.landLength.toFixed(1)} m axis × ${columnsY} column lines along the ${input.landWidth.toFixed(1)} m axis. Total of ${totalColumns} columns at typical floor level.`,
    },
    preliminaryColumnLayout: {
      suggestedNumberOfColumns: totalColumns,
      suggestedSpacing: {
        spacingX,
        spacingY,
        unit: "m",
      },
      columnSizes: {
        interior: columnSizes.interior,
        edge: columnSizes.edge,
        corner: columnSizes.corner,
      },
      notes: `${interiorCount} interior, ${edgeCount} edge, and ${cornerCount} corner columns at typical floor. Align grid with primary building axes to minimise transfers. Increase sizes at lower storeys and near discontinuities as required.`,
    },
    suggestedColumnSpacing: {
      spacingX,
      spacingY,
      unit: "m",
      rationale: `Spacing derived from ${input.buildingType} occupancy guidelines (${min}–${max} m target). Optimised for structural efficiency and architectural flexibility on a ${input.landLength.toFixed(1)} m × ${input.landWidth.toFixed(1)} m footprint.`,
    },
    slabRecommendation: {
      thickness: slabThickness,
      unit: "m",
      type: slabType,
      notes: `Recommended minimum thickness: ${(slabThickness * 1000).toFixed(0)} mm for a maximum span of ${maxSpan.toFixed(1)} m. Allow additional 25–30 mm for finishes and services.`,
    },
    beamRecommendation: {
      mainBeam: beam.mainBeam,
      secondaryBeam: beam.secondaryBeam,
      depthRatio: beam.depthRatio,
      notes: beam.notes,
    },
    foundationRecommendation: {
      type: foundationType,
      depth: getFoundationDepth(input.soilType, input.numberOfFloors),
      bearingCapacity: getBearingCapacity(input.soilType),
      details: `Based on ${input.soilType} and ${input.numberOfFloors} storeys. ${input.seismicZone !== "Zone 0" ? "Provide tie beams between footings and adequate anchorage for seismic load path continuity." : "Standard footing reinforcement and minimum cover per applicable code."}`,
    },
    engineeringObservations,
    seismicNotes,
    materialRecommendations,
    engineeringWarnings,
    engineeringReportScore: complexity,
    costEstimation: quantities,
    visualStructuralGrid: {
      landLength: input.landLength,
      landWidth: input.landWidth,
      columnsX,
      columnsY,
      spacingX,
      spacingY,
      unit: "m",
    },
    generatedAt: new Date().toISOString(),
  };
}
