import type { APIRoute } from 'astro';
import { callBridge, takeUserMessages, sendChatReply } from '../lib/mcpBus.mjs';
import { TOOLS_OPENAI, searchAllDocs, getCodeExamples } from './api/chat';

export const prerender = false;

// MCP-сервер Bulka (Streamable HTTP, stateless JSON-RPC). Через него внешний агент (Claude Desktop /
// Cursor / ChatGPT) полностью управляет живой Bulka.
//
// ЕДИНЫЙ ИСТОЧНИК ТУЛЗОВ: список ниже генерится из того же реестра TOOLS_OPENAI (api/chat.ts),
// что и у встроенного чат-агента и у локального LM Studio — набор тулзов ВЕЗДЕ одинаковый.
// Серверные тулзы (searchDocs/getExamples) считаются здесь теми же функциями, что у агента;
// клиентские (работа с редактором/звуком/консолью) исполняются в окне через SSE-мост тем же
// единым исполнителем execClientTool (repl/agentToolsClient.mjs), что и встроенный агент.

// Тулзы, которые считаются на СЕРВЕРЕ (чистые функции, окно не нужно). Остальные — клиентские.
const SERVER_TOOLS = new Set(['searchDocs', 'getExamples']);

// 12 тулзов из единого реестра — точь-в-точь как у встроенного агента.
const REGISTRY_TOOLS = TOOLS_OPENAI.map((t: any) => ({
  name: t.function.name,
  description: t.function.description,
  inputSchema: t.function.parameters,
}));

// MCP-only тулзы (у встроенного агента их нет по смыслу): удобная связка set+play и двусторонний чат.
const MCP_EXTRA_TOOLS = [
  {
    name: 'setCodeAndPlay',
    description: 'Заменить ВЕСЬ код и сразу запустить воспроизведение (setFullCode + playMusic одной командой).',
    inputSchema: { type: 'object', properties: { code: { type: 'string', description: 'Полный код Strudel' } }, required: ['code'] },
  },
  {
    name: 'getNewMessages',
    description:
      'Прочитать НОВЫЕ сообщения пользователя из чата Bulka (когда в чате выбран провайдер «Внешний агент (MCP)»). Возвращает и очищает очередь. Опрашивай периодически.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'sendChatMessage',
    description: 'Написать ответ (текст) в чат Bulka — пользователь увидит его как сообщение ассистента.',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  },
];

const TOOLS = [...REGISTRY_TOOLS, ...MCP_EXTRA_TOOLS];

export const POST: APIRoute = async ({ request }) => {
  let msg: any;
  try {
    msg = await request.json();
  } catch {
    return rpcJson({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
  }
  const { id, method, params } = msg || {};

  if (method === 'initialize') {
    const clientProto = params?.protocolVersion;
    return rpcJson({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: typeof clientProto === 'string' ? clientProto : '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'bulka', version: '0.2.1' },
      },
    });
  }
  if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
    return new Response(null, { status: 202 });
  }
  if (method === 'ping') return rpcJson({ jsonrpc: '2.0', id, result: {} });
  if (method === 'tools/list') return rpcJson({ jsonrpc: '2.0', id, result: { tools: TOOLS } });

  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments || {};
    const ok = (text: string, isError = false) =>
      rpcJson({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }], isError } });

    // --- MCP-only: двусторонний чат (без окна-моста, кроме доставки ответа) ---
    if (name === 'getNewMessages') {
      const msgs = takeUserMessages();
      return ok(msgs.length ? msgs.map((m: any) => m.text).join('\n---\n') : '(новых сообщений от пользователя нет)');
    }
    if (name === 'sendChatMessage') {
      const sent = sendChatReply(args.text);
      return ok(sent ? 'Отправлено в чат Bulka.' : 'Окно Bulka не подключено.', !sent);
    }

    // --- Серверные тулзы: те же функции, что у встроенного агента (окно не нужно) ---
    if (name === 'searchDocs') {
      const docs = searchAllDocs(args.query || '', 3);
      return ok(docs.join('\n\n---\n\n') || 'Ничего не найдено');
    }
    if (name === 'getExamples') {
      return ok(getCodeExamples(args.category));
    }

    // --- Всё остальное — клиентские тулзы: исполняются в окне через мост (execClientTool) ---
    const isKnownClient = REGISTRY_TOOLS.some((t) => t.name === name && !SERVER_TOOLS.has(t.name)) || name === 'setCodeAndPlay';
    if (!isKnownClient) return ok(`Неизвестный инструмент: ${name}`, true);

    const { result, error } = await callBridge(name, args);
    if (error) return ok(`Ошибка: ${error}`, true);
    const text = typeof result === 'string' ? result : result == null ? 'Готово.' : JSON.stringify(result);
    return ok(text);
  }

  return rpcJson({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
};

// mcp-remote/клиенты могут дёрнуть GET для проверки доступности.
export const GET: APIRoute = async () =>
  new Response('Bulka MCP endpoint — POST JSON-RPC (Streamable HTTP).', { status: 200 });

function rpcJson(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}
