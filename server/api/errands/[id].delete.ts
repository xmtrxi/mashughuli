import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    return sendError(
      event,
      createError({
        status: 404,
        message: "Not Found",
      }),
    );
  }
  const { deleteErrand } = errandService();
  return await deleteErrand(id);
});
