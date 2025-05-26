import { z } from "zod";

export const paymentSchema = z.object({
  errandId: z.string(),
  phone: z.number(),
  amount: z.number(),
});
