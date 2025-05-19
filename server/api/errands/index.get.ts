import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const { getErrands } = errandService();
  const errands = await getErrands();
  return {
    success: true,
    data: errands,
  };
});
