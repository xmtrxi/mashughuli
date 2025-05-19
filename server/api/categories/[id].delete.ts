import { categoryService } from "~/server/services/category.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 404,
      statusMessage: "Id not found",
    });
  }
  try {
    const { deleteCategory } = categoryService();
    return await deleteCategory(id);
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "An error occurred!",
    });
  }
});
