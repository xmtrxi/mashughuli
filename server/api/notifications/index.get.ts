import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);
  
  const query = getQuery(event);
  const limit = Number(query.limit) || 20;
  const offset = Number(query.offset) || 0;
  const onlyUnread = query.unread === 'true';

  try {
    const where = {
      userId: user.id,
      ...(onlyUnread && { read: false })
    };

    const [notifications, totalCount, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId: user.id } }),
      prisma.notification.count({ where: { userId: user.id, read: false } })
    ]);

    return {
      success: true,
      data: notifications,
      meta: {
        total: totalCount,
        unread: unreadCount,
        limit,
        offset
      }
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch notifications"
    });
  }
});
