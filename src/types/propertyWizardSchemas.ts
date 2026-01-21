// ui/src/types/propertyWizardSchemas.ts
import { z } from "zod";

export const propertyDetailsSchema = z.object({
  propertyName: z.string().min(2, 'Property name is required'),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Full address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  buildingCount: z.number().min(1, 'At least 1 building is required').max(20, 'Maximum 20 buildings'),
});