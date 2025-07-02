import { z } from "zod";
const PriorityLevel = z.enum(["low", "medium", "high", "urgent"]);
const ErrandStatus = z.enum([
  "draft",
  "open",
  "in_progress",
  "pending_approval",
  "completed",
  "cancelled",
  "disputed",
]);

// Schema for errand items
const ErrandItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1").default(1),
  estimatedPrice: z.number().min(0).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  specifications: z.string().optional(),
  urgent: z.boolean().default(false),
  notes: z.string().optional(),
});

export { ErrandItemSchema };

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
  hasItemsList: z.boolean().default(false),
  shopName: z.string().optional(),
  estimatedCost: z.number().optional(),
  items: z.array(ErrandItemSchema).optional(),
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
