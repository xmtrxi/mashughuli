import { useAuthUser } from "~/server/services/auth/auth.service";

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);
  
  // Set headers for SSE
  setHeader(event, 'content-type', 'text/event-stream');
  setHeader(event, 'cache-control', 'no-cache');
  setHeader(event, 'connection', 'keep-alive');
  setHeader(event, 'access-control-allow-origin', '*');
  setHeader(event, 'access-control-allow-credentials', 'true');

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', message: 'Connected to notifications' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Set up Redis subscription for user-specific notifications
      const channel = `notifications:${user.id}`;
      
      // Note: You'll need to implement Redis pub/sub here
      // This is a simplified version - in production, you'd use Redis pub/sub
      // to listen for new notifications and send them through the stream
      
      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = `data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeatData));
        } catch (error) {
          console.error('Heartbeat error:', error);
          clearInterval(heartbeat);
        }
      }, 30000); // Send heartbeat every 30 seconds

      // Clean up on close
      event.node.req.on('close', () => {
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });

      event.node.req.on('error', () => {
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });
    },
  });

  return sendStream(event, stream);
});
