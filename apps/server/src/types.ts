import { z } from "zod";

export const playerSchema = z.object({
  username: z.string().min(3).max(15),
  password: z.string().min(3)
});
