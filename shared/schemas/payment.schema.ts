import { z } from "zod";

export const paymentSchema = z.object({
  errandId: z.string(),
  phone: z.string(),
  amount: z.string(),
});
