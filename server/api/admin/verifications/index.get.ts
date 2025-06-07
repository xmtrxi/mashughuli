import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // Admin role is checked by middleware
  try {
    const verifications = await prisma.runnerVerification.findMany({
      where: {
        backgroundCheckStatus: "pending",
      },
      include: {
        runner: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return { success: true, data: verifications };
  } catch (error) {
    console.error("Error fetching verification requests:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch verification requests.",
    });
  }
});
