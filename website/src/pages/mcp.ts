import type { APIRoute } from 'astro';
import { callBridge, takeUserMessages, sendChatReply } from '../lib/mcpBus.mjs';

export const prerender = false;

// MCP-сервер Bulka (Streamable HTTP, stateless JSON-RPC). Через него Claude Desktop / ChatGPT
// (по мосту mcp-remote) полностью управляют живой Bulka: пишут код, играют, останавливают.
// Тулы зеркалят встроенные операции редактора; исполняются в окне Bulka через SSE-мост (mcpBus).

const TOOLS = [
  {
    name: 'set_code',
    description:
      'Заменить ВЕСЬ код в редакторе Bulka на переданный (Strudel/JS live-coding). Не запускает — используй play, чтобы услышать.',
    inputSchema: { type: 'object', properties: { code: { type: 'string', description: 'Полный код Strudel' } }, required: ['code'] },
  },
  {
    name: 'set_code_and_play',
    description: 'Заменить весь код в редакторе и сразу запустить воспроизведение.',
    inputSchema: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] },
  },
  {
    name: 'append_code',
    description: 'Дописать код в конец редактора (например, добавить партию к существующему паттерну).',
    inputSchema: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] },
  },
  { name: 'get_code', description: 'Вернуть текущий код из редактора Bulka.', inputSchema: { type: 'object', properties: {} } },
  { name: 'play', description: 'Запустить/переоценить текущий код (воспроизвести музыку).', inputSchema: { type: 'object', properties: {} } },
  { name: 'stop', description: 'Остановить воспроизведение.', inputSchema: { type: 'object', properties: {} } },
  {
    name: 'get_new_messages',
    description:
      'Прочитать НОВЫЕ сообщения, которые пользователь написал в чате Bulka (когда в чате выбран провайдер «Внешний агент (MCP)»). Возвращает и очищает очередь. Опрашивай периодически, чтобы отвечать пользователю.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'send_chat_message',
    description: 'Написать ответ (текст) в чат Bulka — пользователь увидит его как сообщение ассистента.',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  },
];

const TOOL_TO_BRIDGE: Record<string, string> = {
  set_code: 'setCode',
  set_code_and_play: 'setCodeAndPlay',
  append_code: 'appendCode',
  get_code: 'getCode',
  play: 'play',
  stop: 'stop',
};

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
        serverInfo: { name: 'bulka', version: '0.2.0' },
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

    // Чат через MCP — работают без окна-моста (кроме доставки ответа).
    if (name === 'get_new_messages') {
      const msgs = takeUserMessages();
      const text = msgs.length ? msgs.map((m: any) => m.text).join('\n---\n') : '(новых сообщений от пользователя нет)';
      return rpcJson({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } });
    }
    if (name === 'send_chat_message') {
      const ok = sendChatReply(args.text);
      return rpcJson({
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: ok ? 'Отправлено в чат Bulka.' : 'Окно Bulka не подключено.' }], isError: !ok },
      });
    }

    const bridgeTool = TOOL_TO_BRIDGE[name];
    if (!bridgeTool) {
      return rpcJson({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Неизвестный инструмент: ${name}` }], isError: true } });
    }
    const { result, error } = await callBridge(bridgeTool, args);
    if (error) {
      return rpcJson({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Ошибка: ${error}` }], isError: true } });
    }
    const text = typeof result === 'string' ? result : result == null ? 'Готово.' : JSON.stringify(result);
    return rpcJson({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } });
  }

  return rpcJson({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
};

// mcp-remote/клиенты могут дёрнуть GET для проверки доступности.
export const GET: APIRoute = async () =>
  new Response('Bulka MCP endpoint — POST JSON-RPC (Streamable HTTP).', { status: 200 });

function rpcJson(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}
