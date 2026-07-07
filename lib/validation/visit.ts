import { z } from "zod";

const optionalNote = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

export const visitSchema = z.object({
  place_id: z.string().uuid(),
  visited_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  rating: z.number().int().min(1, "Rate it 1–5").max(5),
  comment: optionalNote,
  good_things: optionalNote,
  bad_things: optionalNote,
});

export const visitIdSchema = z.object({ id: z.string().uuid() });

export type VisitValues = z.infer<typeof visitSchema>;
