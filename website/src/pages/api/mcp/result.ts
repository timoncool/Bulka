import type { APIRoute } from 'astro';
import { deliverResult, subscriberCount } from '../../../lib/mcpBus.mjs';

export const prerender = false;

// Окно Bulka присылает сюда результат исполнения MCP-команды.
export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, result, error } = await request.json();
    const ok = deliverResult(id, result, error);
    return json({ ok });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) }, 400);
  }
};

// Статус моста (для UI настроек): подключено ли окно.
export const GET: APIRoute = async () => json({ connected: subscriberCount() > 0 });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
