import { Peer } from "crossws";
import redisClient from "~/server/utils/redis";

// Use a new Redis client instance specifically for subscribing.
// This is a best practice to prevent a subscribing client from being blocked by other commands.
const subscriber = redisClient?.duplicate();

// This map tracks which topic (roomId) each active WebSocket peer is subscribed to.
// Key: Peer object, Value: string (topic/roomId)
const peerSubscriptions = new Map<Peer, string>();

// This map tracks all the peers subscribed to a specific topic.
// Key: string (topic/roomId), Value: Set<Peer>
const topicSubscriptions = new Map<string, Set<Peer>>();

// Listen for messages from Redis channels
subscriber?.on("message", (channel, message) => {
  try {
    console.log(
      `[Redis SUB] Received message on channel '${channel}': ${message}`,
    );

    const peers = topicSubscriptions.get(channel);
    if (peers) {
      peers.forEach((peer) => {
        // Check if the peer is still connected before sending
        if (peer.readyState === 1) {
          peer.send(message);
        }
      });
    }
  } catch (error) {
    console.error("[Redis SUB] Error processing message:", error);
  }
});

// Helper to manage subscriptions
function subscribePeer(peer: Peer, topic: string) {
  // Unsubscribe from any old topic first
  unsubscribePeer(peer);

  peerSubscriptions.set(peer, topic);
  if (!topicSubscriptions.has(topic)) {
    topicSubscriptions.set(topic, new Set());
  }
  topicSubscriptions.get(topic)!.add(peer);

  // Only subscribe to the Redis channel if it's the first peer for this topic
  if (topicSubscriptions.get(topic)!.size === 1) {
    subscriber?.subscribe(topic, (err) => {
      if (err) {
        console.error(
          `[ws] Failed to subscribe to Redis channel ${topic}:`,
          err,
        );
      } else {
        console.log(`[ws] Subscribed to Redis channel: ${topic}`);
      }
    });
  }
}

// Helper to manage unsubscriptions
function unsubscribePeer(peer: Peer) {
  const topic = peerSubscriptions.get(peer);
  if (topic) {
    peerSubscriptions.delete(peer);
    const peers = topicSubscriptions.get(topic);
    if (peers) {
      peers.delete(peer);
      // If no peers are left on this topic, unsubscribe from Redis
      if (peers.size === 0) {
        topicSubscriptions.delete(topic);
        subscriber?.unsubscribe(topic);
        console.log(`[ws] Unsubscribed from Redis channel: ${topic}`);
      }
    }
  }
}

export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] connection opened:", peer.id);
  },

  close(peer) {
    unsubscribePeer(peer);
    console.log("[ws] connection closed:", peer.id);
  },

  error(peer, error) {
    console.error("[ws] error:", peer.id, error);
    unsubscribePeer(peer);
  },

  message(peer, message) {
    try {
      const data = JSON.parse(message.text());

      if (data.type === "subscribe") {
        const { checkoutRequestId, merchantRequestId } = data;
        const topic = `payment:${checkoutRequestId}:${merchantRequestId}`;

        subscribePeer(peer, topic);

        peer.send(JSON.stringify({ type: "subscribed", roomId: topic }));
      }
    } catch (error) {
      console.error("[ws] Failed to parse message:", error);
    }
  },
});
