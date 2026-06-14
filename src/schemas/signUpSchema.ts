import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(5, "Minimum length of username of length 5")
  .max(10, "Maximum length of username of length 20")
  .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special character ");

export const signUpSchema = z.object({
  username: userNameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be of atleast 6 character" })
    .max(12, { message: "Password must be of atmost 12 character" }),
});
