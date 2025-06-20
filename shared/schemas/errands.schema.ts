import { z } from "zod";
const PriorityLevel = z.enum(["low", "medium", "high", "urgent"]);
const ErrandStatus = z.enum([
  "draft",
  "open",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
]);
export const createErrandSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  addressId: z.string().uuid().nullable().optional(),
  customLocation: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  finalPrice: z.number().optional(),
  priority: PriorityLevel.default("medium"),
  status: ErrandStatus.default("open"),
  visibility: z.boolean().optional(),
});
export const updateErrandSchema = z.object({
  runnerId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  addressId: z.string().uuid().nullable().optional(),
  customLocation: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  finalPrice: z.number().optional(),
  priority: PriorityLevel.default("medium"),
  status: ErrandStatus.default("open"),
  visibility: z.boolean().optional(),
});

export const createBidSchema = z.object({
  errandId: z.string().uuid(),
  price: z.number(),
  estimatedCompletionTime: z.string(),
  experienceDetails: z
    .string()
    .min(20, "Please provide more details about your bid")
    .max(500, "Keep you message unde 500 letters")
    .optional(),
  notes: z.string().optional(),
});
