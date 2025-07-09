import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);
  const notificationId = getRouterParam(event, "id");

  if (!notificationId) {
    throw createError({
      statusCode: 400,
      message: "Notification ID is required"
    });
  }

  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id
      }
    });

    if (!notification) {
      throw createError({
        statusCode: 404,
        message: "Notification not found"
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return {
      success: true,
      data: updatedNotification
    };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to mark notification as read"
    });
  }
});
