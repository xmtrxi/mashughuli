import prisma from "~/lib/prisma";
import { useAuthUser } from "~/server/services/auth/auth.service";

export default defineEventHandler(async (event) => {
  try {
    const user = await useAuthUser(event);
    const userId = user.id;

    // Get all errands the user is a party to (either requester or accepted runner)
    const errands = await prisma.errand.findMany({
      where: {
        OR: [{ requesterId: userId }, { runnerId: userId }],
        // Only show conversations for active errands
        status: { in: ["open", "in_progress", "disputed"] },
      },
      include: {
        requester: { select: { id: true, fullName: true, avatarUrl: true } },
        runner: { select: { id: true, fullName: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                recipientId: userId,
                read: false,
              },
            },
          },
        },
      },
    });

    const supportUser = await prisma.user.findFirst({
      where: { email: "support@mashughuli.com" }, // Your designated support user email
    });

    const conversations = errands
      .map((errand) => {
        const otherUser =
          errand.requesterId === userId ? errand.runner : errand.requester;
        const lastMessage = errand.messages[0];

        // This check is important because an errand might not have a runner yet.
        if (!otherUser) return null;

        return {
          id: `${errand.id}:${[userId, otherUser.id].sort().join(":")}`,
          errandId: errand.id,
          errandTitle: errand.title,
          otherUserId: otherUser.id,
          otherUserName: otherUser.fullName,
          otherUserAvatar: otherUser.avatarUrl,
          lastMessage: lastMessage?.message || "No messages yet.",
          timestamp: (lastMessage?.createdAt || errand.updatedAt).toISOString(),
          unread: errand._count.messages,
        };
      })
      .filter(Boolean); // Filter out nulls

    // Add customer support conversation
    // if (supportUser && supportUser.id !== userId) {
    //   const supportConversationId = supportUser.id;
    //   const supportMessages = await prisma.message.findMany({
    //     where: {
    //       errandId: "support",
    //       OR: [
    //         { senderId: userId, recipientId: supportUser.id },
    //         { senderId: supportUser.id, recipientId: userId },
    //       ],
    //     },
    //     orderBy: { createdAt: "desc" },
    //     take: 1,
    //   });
    //   const unreadSupport = await prisma.message.count({
    //     where: { errandId: "support", recipientId: userId, read: false },
    //   });
    //
    //   conversations.unshift({
    //     id: supportConversationId,
    //     errandId: "support", // Special ID for support chats
    //     errandTitle: "Customer Support",
    //     otherUserId: supportUser.id,
    //     otherUserName: "Mashughuli Support",
    //     otherUserAvatar: null, // Or a dedicated support avatar
    //     lastMessage: supportMessages[0]?.message || "Welcome! How can we help?",
    //     timestamp: (supportMessages[0]?.createdAt || new Date()).toISOString(),
    //     unread: unreadSupport,
    //   });
    // }

    // Sort all conversations by the most recent message
    conversations.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return {
      conversations,
    };
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch conversations",
    });
  }
});
