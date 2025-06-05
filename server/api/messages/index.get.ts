import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { errandId, offset = 0, limit = 50 } = query;

  if (!errandId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Errand ID is required",
    });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { errandId: errandId as string },
      orderBy: { createdAt: "desc" },
      skip: parseInt(offset as string),
      take: parseInt(limit as string),
      include: {
        sender: { omit: { password: true } },
        recipient: { omit: { password: true } },
      },
    });

    const totalCount = await prisma.message.count({
      where: { errandId: errandId as string },
    });

    return {
      messages: messages.reverse(),
      hasMore: parseInt(offset as string) + messages.length < totalCount,
      total: totalCount,
    };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch messages",
      message: "Failed to fetch messages",
    });
  }
});
