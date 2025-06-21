import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const errandId = getRouterParam(event, "id");
  if (!errandId) {
    throw createError({
      statusCode: 404,
      message: "The errands id is not found",
    });
  }
  try {
    const { getErrandPayments } = errandService();
    const transactions = await getErrandPayments(event, errandId);
    return {
      data: transactions,
      success: true,
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred",
    });
  }
});
