import { errandService } from "~/server/services/errands";
import { createBidSchema } from "~/shared/schemas/errands.schema";

export default defineEventHandler(async (event) => {
  const { data, error } = await readValidatedBody(
    event,
    createBidSchema.safeParse,
  );
  if (error) {
    throw createError({
      statusCode: 422,
      message: error.message,
    });
  }
  try {
    const { createBid } = errandService();
    const bid = await createBid(event, data);
    return {
      success: true,
      data: bid,
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode ?? 500,
      message: e.message ?? "An error occurred!!",
    });
  }
});
