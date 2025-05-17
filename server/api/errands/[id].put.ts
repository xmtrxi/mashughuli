import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    return { message: "Not Found" };
  }

  const body = await readBody(event);
  const { updateErrand } = errandService();
  return await updateErrand(id, body);
});
