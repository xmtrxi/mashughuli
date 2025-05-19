import { z } from "zod";

export const createErrandCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  iconName: z.string().optional(),
  active: z.boolean().optional(),
});
export const updateErrandCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  iconName: z.string().optional(),
  active: z.boolean().optional(),
});
