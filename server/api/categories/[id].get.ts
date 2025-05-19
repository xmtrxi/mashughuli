import { categoryService } from "~/server/services/category.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 404,
      statusMessage: "Id is not passed!",
    });
  }
  try {
    const { getCategoryById } = categoryService();
    return await getCategoryById(id);
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "An error occurred!!",
    });
  }
});
