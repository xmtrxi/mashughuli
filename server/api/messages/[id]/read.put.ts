import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const messageId = getRouterParam(event, "id");

  if (!messageId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message ID is required",
    });
  }

  try {
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });

    return { success: true, message: updatedMessage };
  } catch (error) {
    console.error("Failed to mark message as read:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to mark message as read",
    });
  }
});
