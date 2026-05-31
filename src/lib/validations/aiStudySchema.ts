import { z } from "zod";

export const aiStudySchema = z.object({
  buildingType: z.string().min(1, "Building type is required"),
  numberOfFloors: z.coerce.number().int().min(1).max(100),
  landLength: z.coerce.number().positive("Land length must be positive"),
  landWidth: z.coerce.number().positive("Land width must be positive"),
  soilType: z.string().min(1, "Soil type is required"),
  seismicZone: z.string().min(1, "Seismic zone is required"),
  concreteStrength: z.string().min(1, "Concrete strength is required"),
  steelGrade: z.string().min(1, "Steel grade is required"),
});

export type AIStudyFormInput = z.infer<typeof aiStudySchema>;
