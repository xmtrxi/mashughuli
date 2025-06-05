import prisma from "~/lib/prisma";
import { useAuthUser } from "~/server/services/auth/auth.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { errandId, recipientId, message } = body;

  if (!errandId || !recipientId || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  try {
    const user = await useAuthUser(event);

    const savedMessage = await prisma.message.create({
      data: {
        errandId,
        senderId: user.id,
        recipientId,
        message: message.trim(),
      },
      include: {
        sender: { omit: { password: true } },
      },
    });

    return {
      id: savedMessage.id,
      errandId: savedMessage.errandId,
      senderId: savedMessage.senderId,
      recipientId: savedMessage.recipientId,
      message: savedMessage.message,
      read: savedMessage.read,
      createdAt: savedMessage.createdAt.toISOString(),
      sender: savedMessage.sender,
    };
  } catch (error) {
    console.error("Failed to create message:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create message",
      message: "Failed to create message",
    });
  }
});
