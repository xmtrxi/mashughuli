import { bidsService } from "~/server/services/bids.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 404,
      message: "Bid not found",
    });
  }
  try {
    const { getBidById } = bidsService();
    const bid = await getBidById(id);
    return {
      success: true,
      data: bid,
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred!",
    });
  }
});
