import { updateErrandSchema } from "~/server/schemas/errands.schema";
import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    return { message: "Not Found" };
  }

  const { data, error } = await readValidatedBody(
    event,
    updateErrandSchema.safeParse,
  );
  if (error) {
    throw createError({
      statusCode: 422,
      message: error.message,
    });
  }
  try {
    const { updateErrand } = errandService();
    return await updateErrand(id, data);
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.statusMessage || e.message || "An error occurred!!",
    });
  }
});
