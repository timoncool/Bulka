import type { APIRoute } from 'astro';

export const prerender = false;

// Закрытие десктопа: Rust-оболочка просит окно отправить статистику (window.__bulkaHub.flush) и ждёт здесь GET,
// окно по готовности шлёт POST. Окно может успеть раньше, чем оболочка спросит, поэтому ответ запоминается.
let flushed = false;
const waiters = new Set<() => void>();

export const GET: APIRoute = async ({ url }) => {
  const waitMs = Math.min(Number(url.searchParams.get('wait')) || 8000, 15000);
  const done = await new Promise<boolean>((resolve) => {
    if (flushed) return resolve(true);
    const release = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      waiters.delete(release);
      resolve(false);
    }, waitMs);
    waiters.add(release);
  });
  return new Response(JSON.stringify({ flushed: done }), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async () => {
  flushed = true;
  for (const release of waiters) release();
  waiters.clear();
  return new Response(null, { status: 204 });
};
