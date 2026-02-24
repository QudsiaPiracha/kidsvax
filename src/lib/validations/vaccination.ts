import { z } from "zod";

export const administerVaccinationSchema = z.object({
  status: z.literal("administered"),
  administered_date: z.string().min(1, "Administered date is required"),
  physician_name: z.string().min(1, "Physician name is required"),
  product_name: z.string().optional(),
  lot_number: z.string().optional(),
  injection_site: z.string().optional(),
});

export const skipVaccinationSchema = z.object({
  status: z.literal("skipped"),
  skip_reason: z.string().optional(),
});

export const updateVaccinationSchema = z.union([
  administerVaccinationSchema,
  skipVaccinationSchema,
]);

export type AdministerVaccinationInput = z.infer<typeof administerVaccinationSchema>;
export type SkipVaccinationInput = z.infer<typeof skipVaccinationSchema>;
export type UpdateVaccinationInput = z.infer<typeof updateVaccinationSchema>;
