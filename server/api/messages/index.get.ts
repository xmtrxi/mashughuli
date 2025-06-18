import prisma from "~/lib/prisma";
import { useAuthUser } from "~/server/services/auth/auth.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { otherUserId } = query;

  const user = await useAuthUser(event);
  const userId = user.id;

  if (!otherUserId || typeof otherUserId !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Other User ID is required",
    });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    return {
      messages,
    };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch messages",
    });
  }
});
