import { Redis } from "ioredis";
import { PrismaClient } from "@prisma/client";

const redis = new Redis(useRuntimeConfig().redisUrl);
const prisma = new PrismaClient();
const clients = new Map();
const userRooms = new Map(); // Track which rooms users are in

export default defineWebSocketHandler({
  async open(peer) {
    console.log("Client connected:", peer.id);
    clients.set(peer.id, {
      peer,
      userId: null,
      rooms: new Set(),
    });
  },

  async message(peer, message) {
    try {
      const data = JSON.parse(message.text());
      const client = clients.get(peer.id);

      switch (data.type) {
        case "authenticate":
          await handleAuthentication(peer, data);
          break;
        case "join_room":
          await handleJoinRoom(peer, data);
          break;
        case "leave_room":
          await handleLeaveRoom(peer, data);
          break;
        case "send_message":
          await handleSendMessage(peer, data);
          break;
        case "typing":
          await handleTyping(peer, data);
          break;
        case "stop_typing":
          await handleStopTyping(peer, data);
          break;
        case "mark_read":
          await handleMarkRead(peer, data);
          break;
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
      peer.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        }),
      );
    }
  },

  close(peer) {
    console.log("Client disconnected:", peer.id);
    const client = clients.get(peer.id);

    if (client) {
      // Leave all rooms
      client.rooms.forEach((room) => {
        broadcastToRoom(
          room,
          {
            type: "user_left",
            userId: client.userId,
          },
          peer.id,
        );
      });
    }

    clients.delete(peer.id);
  },
});

async function handleAuthentication(peer, data) {
  const client = clients.get(peer.id);
  if (client) {
    client.userId = data.userId;

    peer.send(
      JSON.stringify({
        type: "authenticated",
        userId: data.userId,
      }),
    );
  }
}

async function handleJoinRoom(peer, data) {
  const client = clients.get(peer.id);
  if (!client) return;

  const { room, userId } = data;
  client.rooms.add(room);
  client.userId = userId;

  // Load recent messages from Redis
  const recentMessages = await redis.lrange(`chat:room:${room}`, 0, 49);
  const messages = recentMessages.reverse().map((msg) => JSON.parse(msg));
  const errandId = (room as string).split(":")[0];

  // Load conversation history from database if Redis is empty
  if (messages.length === 0) {
    try {
      const dbMessages = await prisma.message.findMany({
        where: { errandId: errandId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
          recipient: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      });

      // Cache in Redis for future requests
      const pipeline = redis.pipeline();
      dbMessages.reverse().forEach((msg) => {
        pipeline.lpush(
          `chat:room:${room}`,
          JSON.stringify({
            id: msg.id,
            errandId: msg.errandId,
            senderId: msg.senderId,
            recipientId: msg.recipientId,
            message: msg.message,
            read: msg.read,
            createdAt: msg.createdAt.toISOString(),
            sender: msg.sender,
          }),
        );
      });
      pipeline.ltrim(`chat:room:${room}`, 0, 99); // Keep last 100 messages
      await pipeline.exec();

      messages.push(
        ...dbMessages.map((msg) => ({
          id: msg.id,
          errandId: msg.errandId,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          message: msg.message,
          read: msg.read,
          createdAt: msg.createdAt.toISOString(),
          sender: msg.sender,
        })),
      );
    } catch (error) {
      console.error("Failed to load messages from database:", error);
    }
  }

  peer.send(
    JSON.stringify({
      type: "conversation_history",
      room,
      messages,
      hasMore: messages.length === 50,
    }),
  );

  // Notify others in room
  broadcastToRoom(
    room,
    {
      type: "user_joined",
      userId,
      room,
    },
    peer.id,
  );
}

async function handleLeaveRoom(peer, data) {
  const client = clients.get(peer.id);
  if (!client) return;

  const { room } = data;
  client.rooms.delete(room);

  broadcastToRoom(
    room,
    {
      type: "user_left",
      userId: client.userId,
      room,
    },
    peer.id,
  );
}

async function handleSendMessage(peer, data) {
  const client = clients.get(peer.id);
  if (!client) return;

  const { message } = data;
  const room = message.errandId;

  try {
    // Save to database
    const savedMessage = await prisma.message.create({
      data: {
        errandId: message.errandId,
        senderId: message.senderId,
        recipientId: message.recipientId,
        message: message.message,
      },
      include: {
        sender: {
          omit: {
            password: true,
          },
        },
      },
    });

    const messageData = {
      id: savedMessage.id,
      errandId: savedMessage.errandId,
      senderId: savedMessage.senderId,
      recipientId: savedMessage.recipientId,
      message: savedMessage.message,
      read: savedMessage.read,
      createdAt: savedMessage.createdAt.toISOString(),
      sender: savedMessage.sender,
      status: "sent",
    };

    // Cache in Redis
    await redis.lpush(`chat:room:${room}`, JSON.stringify(messageData));
    await redis.ltrim(`chat:room:${room}`, 0, 99);

    // Broadcast to all clients in the room
    broadcastToRoom(room, {
      type: "new_message",
      message: messageData,
    });

    // Send delivery confirmation to sender
    peer.send(
      JSON.stringify({
        type: "message_sent",
        tempId: message.id,
        message: messageData,
      }),
    );
  } catch (error) {
    console.error("Failed to save message:", error);
    peer.send(
      JSON.stringify({
        type: "message_error",
        tempId: message.id,
        error: "Failed to send message",
      }),
    );
  }
}

async function handleTyping(peer, data) {
  const client = clients.get(peer.id);
  if (!client) return;

  const { room } = data;

  broadcastToRoom(
    room,
    {
      type: "user_typing",
      userId: client.userId,
      room,
    },
    peer.id,
  );
}

async function handleStopTyping(peer, data) {
  const client = clients.get(peer.id);
  if (!client) return;

  const { room } = data;

  broadcastToRoom(
    room,
    {
      type: "user_stop_typing",
      userId: client.userId,
      room,
    },
    peer.id,
  );
}

async function handleMarkRead(peer, data) {
  const { messageId } = data;

  try {
    await prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });

    // Notify sender that message was read
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (message) {
      broadcastToUser(message.senderId, {
        type: "message_read",
        messageId,
        readBy: data.userId,
      });
    }
  } catch (error) {
    console.error("Failed to mark message as read:", error);
  }
}

function broadcastToRoom(room, data, excludePeerId = null) {
  const message = JSON.stringify(data);

  clients.forEach((client, peerId) => {
    if (peerId !== excludePeerId && client.rooms.has(room)) {
      client.peer.send(message);
    }
  });
}

function broadcastToUser(userId, data) {
  const message = JSON.stringify(data);

  clients.forEach((client) => {
    if (client.userId === userId) {
      client.peer.send(message);
    }
  });
}
