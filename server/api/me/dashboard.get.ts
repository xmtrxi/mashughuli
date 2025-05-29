import { useAuthUser } from "~/server/services/auth/auth.service";
import { meService } from "~/server/services/me.service";

export default defineEventHandler(async (event) => {
  try {
    const { getDashboardData, getUserErrands } = await meService(event);
    const dashboardData = await getDashboardData();
    const errands = await getUserErrands({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });
    return {
      success: true,
      data: {
        counts: dashboardData,
        errands: errands,
      },
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "Unkown error Occurred",
    });
  }
});
