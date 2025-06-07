import { z } from "zod";

export const paymentSchema = z.object({
  errandId: z.string().uuid(),
  phone: z.string(),
  bidId: z.string().uuid(),
});
