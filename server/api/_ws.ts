const connections = new Map<string, any>();
export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] connection opened");
  },
  message(peer, message) {
    const data = JSON.parse(message.text());
    if (data.type == "subscribe") {
      const roomId = `${data.checkoutRequestId}:${data.merchantRequestId}`;
      connections.set(roomId, peer);

      console.log(`[ws] subscribed to room: ${roomId}`);

      peer.send(JSON.stringify({ type: "subscribed", roomId }));
    }
  },
  close(peer) {
    for (const [roomId, connection] of connections.entries()) {
      if (connection === peer) {
        connections.delete(roomId);
        break;
      }
    }
  },
});

export function notifyPayment(roomId: string, paymentData: any) {
  const peer = connections.get(roomId);
  if (peer) {
    peer.send(
      JSON.stringify({
        type: "payment_update",
        ...paymentData,
      }),
    );
    return true;
  }
  return false;
}
