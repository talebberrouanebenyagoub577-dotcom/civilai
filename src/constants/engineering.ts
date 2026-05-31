export const BUILDING_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Mixed-Use",
  "Institutional",
  "Healthcare",
] as const;

export const SOIL_TYPES = [
  "Rock / Hard Stratum",
  "Dense Sand / Gravel",
  "Medium Clay",
  "Soft Clay",
  "Loose Sand",
  "Fill / Uncontrolled",
] as const;

export const CONCRETE_STRENGTHS = [
  "C20/25",
  "C25/30",
  "C30/37",
  "C35/45",
  "C40/50",
] as const;

export const STEEL_GRADES = ["B400", "B500", "B550"] as const;

export const SEISMIC_ZONES = ["Zone 0", "Zone I", "Zone II", "Zone III", "Zone IV"] as const;

export const WIND_ZONES = ["Zone 1", "Zone 2", "Zone 3", "Zone 4"] as const;

export const DISCLAIMER =
  "These results are preliminary engineering recommendations and must be reviewed and approved by a licensed structural engineer.";

export const APP_NAME = "CivilAI";
