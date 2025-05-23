import { ErrandStatus, PriorityLevel } from "@prisma/client";
import { z } from "zod";
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
  priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.medium),
  status: z.nativeEnum(ErrandStatus).default(ErrandStatus.draft),
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
  priority: z.nativeEnum(PriorityLevel).optional(),
  status: z.nativeEnum(ErrandStatus).optional(),
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
