import { z } from "zod";

export const createMeasurementSchema = z.object({
  height_cm: z.number().positive("Height must be positive").optional(),
  weight_kg: z.number().positive("Weight must be positive").optional(),
  head_circumference_cm: z
    .number()
    .positive("Head circumference must be positive")
    .optional(),
  measured_date: z
    .string()
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      "Invalid date format"
    )
    .optional(),
});

export const updateMeasurementSchema = createMeasurementSchema.partial();

export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type UpdateMeasurementInput = z.infer<typeof updateMeasurementSchema>;
