import { z } from "zod";

export const updateReminderPrefsSchema = z.object({
  u_exam_reminders: z.boolean().optional(),
  vaccination_reminders: z.boolean().optional(),
  reminder_days_before_u_exam: z.number().int().min(1).max(30).optional(),
  reminder_days_before_vaccination: z.number().int().min(1).max(30).optional(),
});

export type UpdateReminderPrefsInput = z.infer<typeof updateReminderPrefsSchema>;
