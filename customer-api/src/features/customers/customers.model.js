import { z } from "zod";
export const createSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});
