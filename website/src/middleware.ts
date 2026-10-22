import { defineMiddleware } from 'astro:middleware';

// MCP and the desktop endpoints serve only the local server of the desktop app (and the dev server); on the
// site they answer 404. The local server answers only to its own name: a page whose domain rebinds to 127.0.0.1
// would otherwise drive the window through /mcp, where code runs next to the person's API keys.
const LOCAL_ONLY = [/^\/mcp\/?$/, /^\/api\/mcp\//, /^\/api\/desktop\//, /^\/api\/save-file\/?$/];
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

const isLocalServer = () => import.meta.env.DEV || process.env.BULKA_DESKTOP === '1';

function localName(value: string | null, asUrl: boolean): boolean {
  if (!value) return false;
  try {
    return LOCAL_HOSTS.has(new URL(asUrl ? value : `http://${value}`).hostname);
  } catch {
    return false;
  }
}

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  if (!isLocalServer()) {
    return LOCAL_ONLY.some((re) => re.test(pathname)) ? new Response('Not found', { status: 404 }) : next();
  }
  const { headers } = context.request;
  const origin = headers.get('origin');
  if (!localName(headers.get('host'), false) || (origin !== null && !localName(origin, true))) {
    return new Response('Bulka answers only on 127.0.0.1 and localhost', { status: 403 });
  }
  return next();
});
