import { Peer } from "crossws";
import prisma from "~/lib/prisma";
import { MessageStatus } from "@prisma/client";

// This interface is still useful for attaching our own metadata to the peer
interface PeerWithMetadata extends Peer {
  userId?: string;
}

export default defineWebSocketHandler({
  open(peer: PeerWithMetadata) {
    console.log("[ws] open", peer.id);
  },

  close(peer: PeerWithMetadata) {
    console.log(`[ws] User ${peer.userId || peer.id} disconnected.`);
  },

  error(peer: PeerWithMetadata, error) {
    console.log(`[ws] error for ${peer.userId || peer.id}`, error);
  },

  async message(peer: PeerWithMetadata, message) {
    try {
      const data = JSON.parse(message.text());

      // --- Authentication: Attach userId to the peer ---
      if (data.type === "auth") {
        peer.userId = data.userId;
        console.log(`[ws] User ${peer.userId} authenticated`);
        peer.send(JSON.stringify({ type: "authed", success: true }));
        return;
      }

      if (!peer.userId) return; // Guard for unauthenticated peers

      // --- Joining a Conversation Room ---
      if (data.type === "join") {
        const { otherUserId } = data;
        // The "room" is now a topic string that we subscribe to
        const conversationId = getConversationId(peer.userId, otherUserId);

        // Subscribe the peer to this conversation topic
        peer.subscribe(conversationId);
        console.log(`[ws] User ${peer.userId} subscribed to ${conversationId}`);

        // Fetch and send message history directly to the peer who just joined
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: peer.userId, recipientId: otherUserId },
              { senderId: otherUserId, recipientId: peer.userId },
            ],
          },
          orderBy: { createdAt: "asc" },
          take: 100,
          include: { sender: { select: { avatarUrl: true } } },
        });
        peer.send(
          JSON.stringify({ type: "history", conversationId, messages }),
        );

        // Mark messages as read and notify the other user
        await prisma.message.updateMany({
          where: {
            recipientId: peer.userId,
            senderId: otherUserId,
            read: false,
          },
          data: { read: true, status: "read" },
        });
        peer.publish(conversationId, JSON.stringify({ type: "messages_read" }));
      }

      // --- Sending a Message ---
      if (data.type === "send") {
        const { errandId, recipientId, message: text } = data;
        const conversationId = getConversationId(peer.userId, recipientId);

        const newMessage = await prisma.message.create({
          data: {
            errandId,
            senderId: peer.userId,
            recipientId,
            message: text,
            status: "sent",
          },
          include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        });

        // Publish the new message to the conversation topic
        // This will send it to both the sender and the recipient if they are subscribed
        peer.publish(
          conversationId,
          JSON.stringify({ type: "message", message: newMessage }),
        );
      }

      // --- Typing Indicator ---
      if (data.type === "typing") {
        const { recipientId } = data;
        const conversationId = getConversationId(peer.userId, recipientId);
        // Publish the typing event to the topic, excluding the sender themselves
        peer.publish(
          conversationId,
          JSON.stringify({ type: "typing", userId: peer.userId }),
          true,
        );
      }
    } catch (e) {
      console.error("[ws] message processing error", e);
    }
  },
});

// A consistent way to generate a conversation ID from two user IDs
function getConversationId(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort();
  return `conversation:${sortedIds[0]}:${sortedIds[1]}`;
}
