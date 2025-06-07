import { Peer } from "crossws";
import { useAuthUser } from "../services/auth/auth.service";
import prisma from "~/lib/prisma";

// In-memory store for active connections
// Key: userId, Value: Peer
const clients = new Map<string, Peer>();

// In-memory store for room subscriptions
// Key: conversationId, Value: Set<userId>
const rooms = new Map<string, Set<string>>();

// Function to generate a consistent conversation ID
function getConversationId(userId1: string, userId2: string, errandId: string) {
  const sortedIds = [userId1, userId2].sort();
  return `${errandId}:${sortedIds[0]}:${sortedIds[1]}`;
}

export default defineWebSocketHandler({
  async open(peer) {
    console.log("[ws] open", peer);
  },

  async close(peer) {
    console.log("[ws] close", peer);
    // Find the user and remove them from all rooms and the client list
    let userIdToRemove: string | null = null;
    for (const [userId, clientPeer] of clients.entries()) {
      if (clientPeer === peer) {
        userIdToRemove = userId;
        break;
      }
    }
    if (userIdToRemove) {
      clients.delete(userIdToRemove);
      rooms.forEach((users, conversationId) => {
        if (users.has(userIdToRemove!)) {
          users.delete(userIdToRemove!);
          // Notify others in the room
          broadcast(
            conversationId,
            {
              type: "user_left",
              userId: userIdToRemove,
            },
            userIdToRemove,
          );
        }
      });
    }
  },

  async error(peer, error) {
    console.log("[ws] error", peer, error);
  },

  async message(peer, message) {
    const data = JSON.parse(message.text());

    if (data.type === "auth") {
      try {
        // In a real app, you would validate the token
        // For now, we trust the userId sent from the client
        const userId = data.userId;
        clients.set(userId, peer);
        console.log(`[ws] User ${userId} authenticated`);
        peer.send(JSON.stringify({ type: "authed", success: true }));
      } catch (e) {
        peer.send(
          JSON.stringify({
            type: "authed",
            success: false,
            error: "Invalid token",
          }),
        );
        peer.close();
      }
      return;
    }

    // All other messages require an authenticated user
    const userId = getUserIdFromPeer(peer);
    if (!userId) {
      return; // Ignore messages from unauthenticated peers
    }

    if (data.type === "join") {
      const { errandId, otherUserId } = data;
      const conversationId = getConversationId(userId, otherUserId, errandId);

      // Subscribe peer to the conversation room
      if (!rooms.has(conversationId)) {
        rooms.set(conversationId, new Set());
      }
      rooms.get(conversationId)!.add(userId);

      console.log(`[ws] User ${userId} joined room ${conversationId}`);

      // Fetch and send message history
      const messages = await prisma.message.findMany({
        where: {
          errandId,
          OR: [
            { senderId: userId, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: userId },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      });

      peer.send(JSON.stringify({ type: "history", conversationId, messages }));
    }

    if (data.type === "send") {
      const { errandId, recipientId, message: text } = data;
      const conversationId = getConversationId(userId, recipientId, errandId);

      const newMessage = await prisma.message.create({
        data: {
          errandId,
          senderId: userId,
          recipientId,
          message: text,
        },
      });

      broadcast(conversationId, {
        type: "message",
        message: newMessage,
      });
    }

    if (data.type === "typing") {
      const { conversationId } = data;
      broadcast(conversationId, { type: "typing", userId }, userId);
    }
  },
});

function getUserIdFromPeer(peer: Peer): string | undefined {
  for (const [userId, clientPeer] of clients.entries()) {
    if (clientPeer === peer) {
      return userId;
    }
  }
  return undefined;
}

function broadcast(conversationId: string, data: any, excludeUserId?: string) {
  const userIds = rooms.get(conversationId);
  if (userIds) {
    const message = JSON.stringify(data);
    for (const userId of userIds) {
      if (userId !== excludeUserId) {
        const peer = clients.get(userId);
        if (peer) {
          peer.send(message);
        }
      }
    }
  }
}
