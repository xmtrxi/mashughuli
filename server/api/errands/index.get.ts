import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const { getErrands } = errandService();
  return await getErrands();
});
