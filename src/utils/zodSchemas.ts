import { z } from "zod";

export const roomRequestSchema = z.object({
  hotel_id: z.string().uuid({ message: "Select a hotel" }),
  stay_start: z.string().min(1, "Required"),
  stay_end: z.string().min(1, "Required"),
  headcount: z.coerce.number().int().positive(),
  singleRooms: z.coerce.number().int().nonnegative(),
  doubleRooms: z.coerce.number().int().nonnegative(),
  notes: z.string().optional(),
}).refine(
  (v) => new Date(v.stay_end) > new Date(v.stay_start),
  { message: "End date must be after start date", path: ["stay_end"] }
).refine(
  (v) => v.singleRooms + v.doubleRooms > 0,
  { message: "Provide at least one room", path: ["singleRooms"] }
);
