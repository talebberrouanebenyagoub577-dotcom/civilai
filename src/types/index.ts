export interface EngineeringStudy {
  preliminaryStructuralStudy: string;
  recommendedColumnGrid: {
    columnsX: number;
    columnsY: number;
    totalColumns: number;
    description: string;
  };
  suggestedColumnSpacing: {
    spacingX: number;
    spacingY: number;
    unit: string;
    rationale: string;
  };
  preliminaryBeamDimensions: {
    mainBeam: string;
    secondaryBeam: string;
    depthRatio: string;
    notes: string;
  };
  preliminarySlabThickness: {
    thickness: number;
    unit: string;
    type: string;
    notes: string;
  };
  foundationRecommendation: {
    type: string;
    depth: string;
    bearingCapacity: string;
    details: string;
  };
  engineeringObservations: string[];
  riskWarnings: string[];
  technicalNotes: string[];
  generatedAt: string;
}

export interface ProjectInput {
  projectName: string;
  buildingType: string;
  landLength: number;
  landWidth: number;
  numberOfFloors: number;
  buildingHeight: number;
  soilType: string;
  concreteStrength: string;
  steelGrade: string;
  seismicZone: string;
  windZone: string;
  hasParking: boolean;
}

export interface ProjectWithStudy extends ProjectInput {
  id: string;
  studyGenerated: boolean;
  studyData: EngineeringStudy | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIStudyInput {
  buildingType: string;
  numberOfFloors: number;
  landLength: number;
  landWidth: number;
  soilType: string;
  seismicZone: string;
  concreteStrength: string;
  steelGrade: string;
}

export interface AIStudyReport {
  buildingSummary: {
    buildingType: string;
    numberOfFloors: number;
    totalArea: number;
    unit: string;
    footprint: string;
    notes: string;
  };
  columnGridCalculation: {
    columnsX: number;
    columnsY: number;
    totalColumns: number;
    spacingX: number;
    spacingY: number;
    unit: string;
    residualNotes: string;
    coordinates: Array<{
      label: string;
      x: number;
      y: number;
      unit: string;
      type: "corner" | "edge" | "interior";
    }>;
  };
  suggestedStructuralGrid: {
    columnsX: number;
    columnsY: number;
    totalColumns: number;
    gridType: string;
    description: string;
  };
  preliminaryColumnLayout: {
    suggestedNumberOfColumns: number;
    suggestedSpacing: {
      spacingX: number;
      spacingY: number;
      unit: string;
    };
    columnSizes: {
      interior: string;
      edge: string;
      corner: string;
    };
    notes: string;
  };
  suggestedColumnSpacing: {
    spacingX: number;
    spacingY: number;
    unit: string;
    rationale: string;
  };
  slabRecommendation: {
    thickness: number;
    unit: string;
    type: string;
    notes: string;
  };
  beamRecommendation: {
    mainBeam: string;
    secondaryBeam: string;
    depthRatio: string;
    notes: string;
  };
  foundationRecommendation: {
    type: string;
    depth: string;
    bearingCapacity: string;
    details: string;
  };
  engineeringObservations: string[];
  seismicNotes: string[];
  materialRecommendations: {
    concrete: string[];
    steel: string[];
  };
  engineeringWarnings: string[];
  engineeringReportScore: {
    level: "Low" | "Medium" | "High";
    score: number;
    drivers: string[];
  };
  costEstimation: {
    concreteVolumeM3: number;
    steelQuantityTonnes: number;
    steelRateKgPerM3: number;
    assumptions: string[];
  };
  visualStructuralGrid: {
    landLength: number;
    landWidth: number;
    columnsX: number;
    columnsY: number;
    spacingX: number;
    spacingY: number;
    unit: string;
  };
  generatedAt: string;
}
