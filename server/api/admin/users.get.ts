import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      omit: {
        password: true, // Never expose passwords
      },
    });
    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("Failed to fetch users for admin:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Could not fetch users.",
    });
  }
});
