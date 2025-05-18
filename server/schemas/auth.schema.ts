import { z } from "zod";
export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const userSchema = z.object({
  email: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().optional(),
  phoneNumber: z.string(),
  primaryRole: z.string(),
  password: z.string(),
});
