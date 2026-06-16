import { z } from "zod";

export const verifySchema = z.object({
  username: z.string(),
  code: z.string().length(6, "Code must be of length 6"),
});
