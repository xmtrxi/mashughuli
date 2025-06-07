import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // Admin check is handled by middleware
  try {
    const disputes = await prisma.dispute.findMany({
      where: {
        status: "open",
      },
      include: {
        errand: { select: { title: true } },
        requester: { select: { fullName: true } },
        runner: { select: { fullName: true } },
        filedByUser: { select: { fullName: true } },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return { success: true, data: disputes };
  } catch (error) {
    console.error("Error fetching disputes:", error);
    throw createError({
      statusCode: 500,
      message: "Could not fetch disputes.",
    });
  }
});
