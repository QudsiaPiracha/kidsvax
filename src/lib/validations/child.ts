import { z } from "zod";

export const createChildSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date_of_birth: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    },
    "Date of birth cannot be in the future"
  ),
  gender: z.enum(["male", "female", "diverse"]),
  is_premature: z.boolean().default(false),
  allergies: z.string().optional(),
  notes: z.string().optional(),
  photo_url: z.string().url().optional(),
  blood_type: z.string().optional(),
});

export const updateChildSchema = createChildSchema.partial();

export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;
