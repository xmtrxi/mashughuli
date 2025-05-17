import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { createErrands } = errandService();
  return await createErrands(body);
});
