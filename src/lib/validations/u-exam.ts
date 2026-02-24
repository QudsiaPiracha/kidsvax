import { z } from "zod";

const baseSchema = z.object({
  findings_notes: z.string().optional(),
  parent_observations: z.string().optional(),
  referrals: z.string().optional(),
});

export const completeUExamSchema = baseSchema.extend({
  status: z.literal("completed"),
  completed_date: z.string().min(1, "Completed date is required"),
  physician_name: z.string().min(1, "Physician name is required"),
});

export const skipUExamSchema = z.object({
  status: z.literal("skipped"),
});

export const updateUExamSchema = z.union([
  completeUExamSchema,
  skipUExamSchema,
]);

export type CompleteUExamInput = z.infer<typeof completeUExamSchema>;
export type SkipUExamInput = z.infer<typeof skipUExamSchema>;
export type UpdateUExamInput = z.infer<typeof updateUExamSchema>;
