import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);

  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false
      },
      data: { read: true }
    });

    return {
      success: true,
      message: `Marked ${result.count} notifications as read`,
      data: { count: result.count }
    };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to mark notifications as read"
    });
  }
});
