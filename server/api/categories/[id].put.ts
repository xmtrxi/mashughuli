import { updateErrandCategorySchema } from "~/shared/schemas/category.schema";
import { useAuthUser } from "~/server/services/auth/auth.service";
import { categoryService } from "~/server/services/category.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 404,
      statusMessage: "Id not passed!",
    });
  }
  const { data, error } = await readValidatedBody(
    event,
    updateErrandCategorySchema.safeParse,
  );
  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: error.message,
    });
  }
  try {
    await useAuthUser(event);
    const { updateCategory } = categoryService();
    return await updateCategory(id, data);
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || "An error occurred!!",
    });
  }
});
