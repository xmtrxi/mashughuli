import { meService } from "~/server/services/me.service";

export default defineEventHandler(async (event) => {
  try {
    const { getUserErrands, user } = await meService(event);
    const errands = await getUserErrands();
    return {
      success: true,
      data: errands,
      user: user,
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred!!",
    });
  }
});
