import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, "Content should be of atleast 10 character")
    .max(300, "Content should be no longer than 300 character"),
  username: z.string(),
});

export const messageIdSchema = z.object({
  messageId: z.string(),
});
