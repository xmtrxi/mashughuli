import { errandService } from "~/server/services/errands";
import { cacheGet, cacheSet } from "~/server/utils/redis";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const cacheKey = `errands:list:${JSON.stringify(query)}`;
  
  // Try to get from cache first
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return {
      success: true,
      data: cached,
      cached: true
    };
  }
  
  const { getErrands } = errandService();
  const errands = await getErrands();
  
  // Cache the result for 5 minutes
  await cacheSet(cacheKey, errands, 300);
  
  return {
    success: true,
    data: errands,
  };
});
