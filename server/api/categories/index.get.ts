import { categoryService } from "~/server/services/category.service";

export default defineEventHandler(async (event) => {
  try {
    const { getCategories } = categoryService();
    return {
      success: true,
      data: await getCategories(),
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode,
      statusMessage: e.statusMessage,
    });
  }
});
