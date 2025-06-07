import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const errands = await prisma.errand.findMany({
      include: {
        requester: {
          select: { fullName: true, email: true },
        },
        runner: {
          select: { fullName: true, email: true },
        },
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return {
      success: true,
      data: errands,
    };
  } catch (error) {
    console.error("Failed to fetch errands for admin:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Could not fetch errands.",
    });
  }
});
