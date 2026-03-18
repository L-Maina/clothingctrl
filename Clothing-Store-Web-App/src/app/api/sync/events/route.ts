import { NextRequest } from 'next/server';
import { syncEmitter, SyncEventData } from '@/lib/sync-events';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Send recent events on connection
      sendRecentEvents(controller, encoder);

      // Subscribe to sync events
      const unsubscribe = syncEmitter.subscribe((event: SyncEventData) => {
        try {
          const message = `data: ${JSON.stringify({
            ...event,
            timestamp: new Date().toISOString(),
          })}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending SSE event:', error);
        }
      });

      // Send keepalive every 30 seconds
      const keepaliveInterval = setInterval(() => {
        try {
          const keepaliveMessage = `data: ${JSON.stringify({ type: 'KEEPALIVE', timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(encoder.encode(keepaliveMessage));
        } catch {
          clearInterval(keepaliveInterval);
        }
      }, 30000);

      // Handle client disconnect
      const cleanup = () => {
        unsubscribe();
        clearInterval(keepaliveInterval);
      };

      // Store cleanup function for later use
      // Note: In production, you might want to use request.signal
      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// Send recent events from the last 5 minutes on connection
async function sendRecentEvents(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentEvents = await db.syncEvent.findMany({
      where: {
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    for (const event of recentEvents.reverse()) {
      const message = `data: ${JSON.stringify({
        type: event.type,
        action: event.action,
        data: JSON.parse(event.data),
        timestamp: event.createdAt.toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(message));
    }
  } catch (error) {
    console.error('Error sending recent events:', error);
  }
}
