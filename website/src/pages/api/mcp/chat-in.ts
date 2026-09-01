import type { APIRoute } from 'astro';
import { pushUserMessage } from '../../../lib/mcpBus.mjs';

export const prerender = false;

// Чат Bulka (провайдер «Внешний агент (MCP)») кладёт сюда сообщение пользователя,
// внешний агент забирает его тулом get_new_messages.
export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = await request.json();
    pushUserMessage(text);
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || String(e) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
