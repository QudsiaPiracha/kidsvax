import { z } from "zod";

export const VALID_DOCUMENT_TYPES = [
  "vaccination_record",
  "u_exam_record",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const scanRequestSchema = z.object({
  image: z.string().min(1, "Image is required"),
  document_type: z.enum(VALID_DOCUMENT_TYPES, {
    errorMap: () => ({
      message: "Invalid document type. Must be vaccination_record or u_exam_record",
    }),
  }),
});

export const confirmVaccinationSchema = z.object({
  child_id: z.string().uuid("Invalid child ID"),
  items: z.array(
    z.object({
      vaccine_name: z.string().min(1),
      dose_number: z.number().int().positive(),
      administered_date: z.string().min(1),
      physician_name: z.string().optional(),
    })
  ),
});

export const confirmUExamSchema = z.object({
  child_id: z.string().uuid("Invalid child ID"),
  items: z.array(
    z.object({
      exam_type: z.string().min(1),
      exam_date: z.string().min(1),
      physician_name: z.string().optional(),
    })
  ),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;
export type ConfirmVaccinationRequest = z.infer<typeof confirmVaccinationSchema>;
export type ConfirmUExamRequest = z.infer<typeof confirmUExamSchema>;
