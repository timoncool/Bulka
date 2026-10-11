import type { APIRoute } from 'astro';
import { addSubscriber } from '../../../lib/mcpBus.mjs';

export const prerender = false;

// SSE-канал: окно Bulka подписывается сюда и получает команды MCP-тулов для исполнения.
export const GET: APIRoute = async () => {
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const safeEnqueue = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };
      safeEnqueue(': connected\n\n');
      const unsub = addSubscriber({ send: (cmd: unknown) => safeEnqueue(`data: ${JSON.stringify(cmd)}\n\n`) });
      const keepalive = setInterval(() => safeEnqueue(': ping\n\n'), 20000);
      cleanup = () => {
        clearInterval(keepalive);
        unsub();
        try {
          controller.close();
        } catch {
          /* уже закрыт */
        }
      };
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
};
