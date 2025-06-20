// ~/shared/schemas/profile.schema.ts
import { z } from "zod";

// Define the profile schema
export const profileSchema = z.object({
  id: z.string().optional(), // Include if the ID is part of the fetched data
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(1, "Full name is required"),
  avatarUrl: z.string().url("Please enter a valid URL").optional(),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"), // Basic phone number validation
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  primaryRole: z.enum(["ROLE1", "ROLE2"] as const).optional(), // Add if used in updateUser
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(), // Add if password updates are allowed
  categories: z.object({}).optional(), // Adjust based on your actual categories structure
});

// Type inference from schema
export type ProfileData = z.infer<typeof profileSchema>;

// Default profile data
export const defaultProfileData: ProfileData = {
  email: "",
  fullName: "",
  avatarUrl: undefined, // Use undefined since it's optional
  phoneNumber: "",
  bio: "",
  primaryRole: undefined,
  password: undefined,
  categories: undefined,
};
