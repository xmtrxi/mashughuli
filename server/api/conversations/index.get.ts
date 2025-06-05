import prisma from "~/lib/prisma";
import { useAuthUser } from "~/server/services/auth/auth.service";

export default defineEventHandler(async (event) => {
  try {
    const user = await useAuthUser(event);

    // Get conversations based on:
    // 1. Errands where user is requester and there are bids
    // 2. Errands where user has placed bids
    // 3. Existing message threads

    const [requesterConversations, bidderConversations] = await Promise.all([
      // User is errand requester - get all bidders on their errands
      prisma.errand.findMany({
        where: {
          requesterId: user.id,
          bids: {
            some: {}, // Has at least one bid
          },
        },
        include: {
          bids: {
            where: {
              status: {
                in: ["pending", "accepted"], // Only active bids
              },
            },
            include: {
              runner: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: {
                  recipientId: user.id,
                  read: false,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),

      // User is bidder - get errands they've bid on
      prisma.errand.findMany({
        where: {
          bids: {
            some: {
              runnerId: user.id,
              status: {
                in: ["pending", "accepted"],
              },
            },
          },
        },
        include: {
          requester: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          bids: {
            where: {
              runnerId: user.id,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: {
                  recipientId: user.id,
                  read: false,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
    ]);

    const conversations = [];

    // Process requester conversations (one per bidder per errand)
    requesterConversations.forEach((errand) => {
      errand.bids.forEach((bid) => {
        const conversationId = `${errand.id}:${bid.runnerId}`;
        const lastMessage = errand.messages.find(
          (msg) =>
            (msg.senderId === user.id && msg.recipientId === bid.runnerId) ||
            (msg.senderId === bid.runnerId && msg.recipientId === user.id),
        );

        conversations.push({
          id: conversationId,
          errandId: errand.id,
          otherUserId: bid.runner.id,
          otherUserName: bid.runner.fullName,
          otherUserAvatar: bid.runner.avatarUrl,
          lastMessage: lastMessage?.message || `Bid placed: KES ${bid.price}`,
          timestamp:
            lastMessage?.createdAt?.toISOString() ||
            bid.createdAt.toISOString(),
          unread: errand._count.messages,
          errandTitle: errand.title,
          bidAmount: bid.price,
          bidStatus: bid.status,
          userRole: "requester",
          conversationType: "bid_conversation",
        });
      });
    });

    // Process bidder conversations
    bidderConversations.forEach((errand) => {
      const bid = errand.bids[0]; // User's bid on this errand
      const conversationId = `${errand.id}-${user.id}`;
      const lastMessage = errand.messages.find(
        (msg) =>
          (msg.senderId === user.id &&
            msg.recipientId === errand.requesterId) ||
          (msg.senderId === errand.requesterId && msg.recipientId === user.id),
      );

      conversations.push({
        id: conversationId,
        errandId: errand.id,
        otherUserId: errand.requester.id,
        otherUserName: errand.requester.fullName,
        otherUserAvatar: errand.requester.avatarUrl,
        lastMessage: lastMessage?.message || `Your bid: KES ${bid.price}`,
        timestamp:
          lastMessage?.createdAt?.toISOString() || bid.createdAt.toISOString(),
        unread: errand._count.messages,
        errandTitle: errand.title,
        bidAmount: bid.price,
        bidStatus: bid.status,
        userRole: "bidder",
        conversationType: "bid_conversation",
      });
    });

    // Remove duplicates and sort by timestamp
    const uniqueConversations = conversations
      .filter(
        (conv, index, self) =>
          index === self.findIndex((c) => c.id === conv.id),
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    return {
      conversations: uniqueConversations,
    };
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch conversations",
    });
  }
});
