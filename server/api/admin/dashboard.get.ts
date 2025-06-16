import prisma from "~/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export default defineEventHandler(async (event) => {
  try {
    const today = new Date();
    const last30Days = subDays(today, 30);

    const [
      totalUsers,
      totalErrands,
      totalTransactions,
      openDisputes,
      usersLast30Days,
      errandsLast30Days,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.errand.count(),
      prisma.transaction.aggregate({ _sum: { amount: true } }),
      prisma.dispute.count({ where: { status: "open" } }),
      prisma.user.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: last30Days } },
        _count: { _all: true },
      }),
      prisma.errand.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: last30Days } },
        _count: { _all: true },
      }),
    ]);

    const platformRevenue = await prisma.transaction.aggregate({
      _sum: { platformFee: true },
    });

    // Helper to aggregate data by day for charts
    const aggregateByDay = (
      data: { createdAt: Date; _count: { _all: number } }[],
    ) => {
      const dailyCounts: Record<string, number> = {};
      for (const item of data) {
        const day = startOfDay(item.createdAt).toISOString().split("T")[0];
        dailyCounts[day] = (dailyCounts[day] || 0) + item._count._all;
      }
      return dailyCounts;
    };

    return {
      success: true,
      data: {
        totalUsers,
        totalErrands,
        totalVolume: totalTransactions._sum.amount ?? 0,
        platformRevenue: platformRevenue._sum.platformFee ?? 0,
        openDisputes,
        charts: {
          users: aggregateByDay(usersLast30Days),
          errands: aggregateByDay(errandsLast30Days),
        },
      },
    };
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Could not fetch admin dashboard data.",
    });
  }
});
