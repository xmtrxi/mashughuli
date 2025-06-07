import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const [totalUsers, totalErrands, totalTransactions, openDisputes] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.errand.count(),
        prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
        }),
        prisma.dispute.count({
          where: {
            status: "open",
          },
        }),
      ]);

    const platformRevenue = await prisma.transaction.aggregate({
      _sum: {
        platformFee: true,
      },
    });

    return {
      success: true,
      data: {
        totalUsers,
        totalErrands,
        totalVolume: totalTransactions._sum.amount ?? 0,
        platformRevenue: platformRevenue._sum.platformFee ?? 0,
        openDisputes,
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
