import { z } from "zod";

export const toggleMilestoneSchema = z.object({
  achieved: z.boolean(),
  observed_date: z
    .string()
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      "Invalid date format"
    )
    .optional(),
});

export type ToggleMilestoneInput = z.infer<typeof toggleMilestoneSchema>;
