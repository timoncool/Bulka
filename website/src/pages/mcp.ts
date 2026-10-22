import type { APIRoute } from 'astro';
import { callBridge, takeUserMessages, sendChatReply } from '../lib/mcpBus.mjs';
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { TOOLS_OPENAI, searchAllDocs, getCodeExamples } from './api/chat';
import { APP_TOOLS, APP_TOOL_NAMES } from '../lib/appToolSchemas.mjs';
import { recordingsDir } from '../lib/appDir';
import reference from '../../../doc.json';
import referenceEn from '../../../doc.en.json';
import desktopConf from '../../../desktop/src-tauri/tauri.conf.json';

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

// Тулзы из единого реестра — точь-в-точь как у встроенного агента.
const REGISTRY_TOOLS = TOOLS_OPENAI.map((t: any) => ({
  name: t.function.name,
  description: t.function.description,
  inputSchema:
    t.function.name === 'searchDocs'
      ? {
          ...t.function.parameters,
          properties: {
            ...t.function.parameters.properties,
            lang: { type: 'string', enum: ['ru', 'en'], description: 'Язык документации, по умолчанию ru' },
          },
        }
      : t.function.parameters,
}));

// MCP-only тулзы (у встроенного агента их нет по смыслу): удобная связка set+play и двусторонний чат.
const MCP_EXTRA_TOOLS = [
  {
    name: 'setCodeAndPlay',
    description: 'Заменить ВЕСЬ код и сразу запустить воспроизведение (setFullCode + playMusic одной командой).',
    inputSchema: {
      type: 'object',
      properties: { code: { type: 'string', description: 'Полный код Strudel' } },
      required: ['code'],
    },
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

// Серверные тулзы только для MCP: справка по функции и записи десктопа.
const MCP_SERVER_TOOLS = [
  {
    name: 'getReference',
    description:
      'Справка по функции Strudel/Bulka (как вкладка «справка»): описание, параметры, синонимы, примеры. Ищет по имени и синонимам.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Имя функции, например lpf или stackCenter' },
        lang: { type: 'string', enum: ['ru', 'en'], description: 'Язык справки, по умолчанию ru' },
      },
      required: ['name'],
    },
  },
  {
    name: 'listRecordings',
    description: 'Записи и экспорты WAV десктопа (папка recordings рядом с приложением): путь, размер, дата.',
    inputSchema: { type: 'object', properties: {} },
  },
];

const TOOLS = [...REGISTRY_TOOLS, ...MCP_EXTRA_TOOLS, ...MCP_SERVER_TOOLS, ...APP_TOOLS];

const stripHtml = (s: string = '') =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();

function lookupReference(name: string, lang: string = 'ru'): string {
  const q = String(name || '').trim();
  if (!q) throw new Error('name пустой');
  if (lang !== 'ru' && lang !== 'en') throw new Error('lang — ru или en');
  const docs: any[] = ((lang === 'en' ? referenceEn : reference) as any).docs;
  const hit =
    docs.find((d) => d.name === q || d.longname === q) ||
    docs.find((d) => (d.synonyms || []).includes(q)) ||
    docs.find((d) => d.name?.toLowerCase() === q.toLowerCase());
  if (!hit) {
    const near = docs
      .filter((d) => d.name?.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 8)
      .map((d) => d.name);
    throw new Error(`функции «${q}» в справке нет${near.length ? `; похожие: ${near.join(', ')}` : ''}`);
  }
  const label =
    lang === 'en'
      ? { synonyms: 'synonyms', params: 'Parameters', example: 'Example' }
      : { synonyms: 'синонимы', params: 'Параметры', example: 'Пример' };
  const params = (hit.params || []).map((p: any) => `- ${p.name}: ${stripHtml(p.description)}`).join('\n');
  return [
    `# ${hit.name}${hit.synonyms?.length ? ` (${label.synonyms}: ${hit.synonyms.join(', ')})` : ''}`,
    stripHtml(hit.description),
    params && `${label.params}:\n${params}`,
    ...(hit.examples || []).map((e: string, i: number) => `${label.example} ${i + 1}:\n${e}`),
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function listRecordings(): Promise<string> {
  const root = recordingsDir();
  const out: { path: string; bytes: number; modified: string }[] = [];
  const walk = async (dir: string) => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (e: any) {
      if (e.code === 'ENOENT' && dir === root) return;
      throw e;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else {
        const s = await stat(p);
        out.push({ path: relative(root, p), bytes: s.size, modified: s.mtime.toISOString() });
      }
    }
  };
  await walk(root);
  return JSON.stringify({ folder: root, files: out });
}

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
        serverInfo: { name: 'bulka', version: desktopConf.version },
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
      const lang = args.lang ?? 'ru';
      if (lang !== 'ru' && lang !== 'en') return ok(`Ошибка: lang — ru или en`, true);
      const docs = searchAllDocs(args.query || '', 3, lang);
      return ok(docs.join('\n\n---\n\n') || 'Ничего не найдено');
    }
    if (name === 'getExamples') {
      return ok(getCodeExamples(args.category));
    }
    if (name === 'getReference' || name === 'listRecordings') {
      try {
        return ok(name === 'getReference' ? lookupReference(args.name, args.lang) : await listRecordings());
      } catch (e: any) {
        return ok(`Ошибка: ${e.message}`, true);
      }
    }

    // --- Всё остальное — клиентские тулзы: исполняются в окне через мост (execClientTool) ---
    const isKnownClient =
      REGISTRY_TOOLS.some((t) => t.name === name && !SERVER_TOOLS.has(t.name)) ||
      name === 'setCodeAndPlay' ||
      APP_TOOL_NAMES.has(name);
    if (!isKnownClient) return ok(`Неизвестный инструмент: ${name}`, true);

    // Рендер WAV и запрос доступа к аудиоустройствам ждут дольше обычной команды.
    const timeoutMs = name === 'exportWav' ? 600_000 : name === 'listAudioDevices' ? 120_000 : 20_000;
    const { result, error } = await callBridge(name, args, timeoutMs);
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
