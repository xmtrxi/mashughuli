import { createErrandCategorySchema } from "~/server/schemas/category.schema";
import { useAuthUser } from "~/server/services/auth/auth.service";
import { categoryService } from "~/server/services/category.service";

export default defineEventHandler(async (event) => {
  const { data, error } = await readValidatedBody(
    event,
    createErrandCategorySchema.safeParse,
  );
  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: error.message,
    });
  }
  try {
    await useAuthUser(event);
    const { createCategories } = categoryService();
    const category = await createCategories(data);
    return {
      success: true,
      data: category,
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "An error occurred!!",
    });
  }
});
