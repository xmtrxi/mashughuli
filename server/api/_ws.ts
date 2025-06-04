const connections = new Map<string, any>();
export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] connection opened");
  },
  message(peer, message) {
    const data = JSON.parse(message.text());

    if (data.type === "subscribe") {
      const roomId = `${data.checkoutRequestId}:${data.merchantRequestId}`;
      connections.set(roomId, peer);
      console.log(`[ws] subscribed to room: ${roomId}`);

      peer.send(
        JSON.stringify({
          type: "subscribed",
          roomId,
          status: "connected",
        }),
      );
    }
  },
  close(peer) {
    for (const [roomId, connection] of connections.entries()) {
      if (connection === peer) {
        connections.delete(roomId);
        console.log(`[ws] connection closed for room: ${roomId}`);
        break;
      }
    }
  },
  error(peer, error) {
    console.error("[ws] error:", error);
  },
});

export function notifyPayment(roomId: string, paymentData: any) {
  const peer = connections.get(roomId);
  if (peer) {
    try {
      peer.send(
        JSON.stringify({
          type: "payment_update",
          ...paymentData,
        }),
      );
      console.log(`[ws] notification sent to room: ${roomId}`);
      return true;
    } catch (error) {
      console.error("[ws] failed to send notification:", error);
      // Clean up dead connection
      connections.delete(roomId);
      return false;
    }
  }
  console.log(`[ws] no connection found for room: ${roomId}`);
  return false;
}
