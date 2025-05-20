import { z } from "zod";
export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const userSchema = z.object({
  email: z.string().email(),
  fullName: z.string(),
  avatarUrl: z.string().optional(),
  phoneNumber: z.string(),
  primaryRole: z.enum(["requester", "runner"], {
    required_error: "Please select a user type",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
