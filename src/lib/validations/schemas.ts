import { z } from "zod";

export const projectSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
  buildingType: z.string().min(1, "Building type is required"),
  landLength: z.coerce.number().positive("Land length must be positive"),
  landWidth: z.coerce.number().positive("Land width must be positive"),
  numberOfFloors: z.coerce.number().int().min(1).max(100),
  buildingHeight: z.coerce.number().positive("Building height must be positive"),
  soilType: z.string().min(1, "Soil type is required"),
  concreteStrength: z.string().min(1, "Concrete strength is required"),
  steelGrade: z.string().min(1, "Steel grade is required"),
  seismicZone: z.string().min(1, "Seismic zone is required"),
  windZone: z.string().min(1, "Wind zone is required"),
  hasParking: z.coerce.boolean(),
});

export type ProjectFormInput = z.infer<typeof projectSchema>;
