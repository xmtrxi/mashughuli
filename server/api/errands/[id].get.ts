import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 404,
      statusMessage: "Id is not passed",
    });
  }
  try {
    const { getErrandById } = errandService();
    const errand = await getErrandById(id);
    return {
      success: true,
      data: errand,
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "An error Occurred",
    });
  }
});
