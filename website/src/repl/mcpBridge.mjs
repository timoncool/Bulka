// Клиент MCP-моста (десктоп). Подписывается на SSE-канал Node-сервера, исполняет команды
// MCP-тулов через редактор Bulka и возвращает результат. Так внешний Claude Desktop / ChatGPT
// (через mcp-remote → /mcp → эта шина) реально управляют живым приложением.
// Активно ТОЛЬКО когда сайт раздаётся локально (десктоп: 127.0.0.1/localhost). На bulka.app — no-op.

import { execClientTool } from './agentToolsClient.mjs';
import { APP_TOOL_NAMES, execAppTool } from './appTools.mjs';

let es = null;
let getEditorRef = null;
let getActionsRef = null;
let installed = false;
const statusListeners = new Set();

export function installMcpBridge(getEditor, { autoStart = true, getActions } = {}) {
  if (typeof window === 'undefined') return;
  const host = location.hostname;
  if (host !== '127.0.0.1' && host !== 'localhost') return; // только десктоп
  getEditorRef = getEditor;
  getActionsRef = getActions;
  if (!installed) {
    installed = true;
    window.__bulkaMcp = {
      start,
      stop,
      restart,
      isConnected: () => !!es,
      onStatus: (fn) => {
        statusListeners.add(fn);
        return () => statusListeners.delete(fn);
      },
    };
  }
  if (autoStart) start();
}

function emit(state) {
  for (const fn of statusListeners) {
    try {
      fn(state);
    } catch (e) {
      console.error('[mcp-bridge] status listener', e);
    }
  }
}

function start() {
  if (es || !getEditorRef) return;
  try {
    es = new EventSource('/api/mcp/events');
  } catch (e) {
    console.error('[mcp-bridge] /api/mcp/events', e);
    return;
  }
  es.onopen = () => emit('connected');
  es.onerror = () => emit('reconnecting'); // EventSource сам переподключается
  es.onmessage = handleMessage;
}

function stop() {
  if (es) {
    es.close();
    es = null;
    emit('stopped');
  }
}

function restart() {
  stop();
  setTimeout(start, 200);
}

async function handleMessage(ev) {
  let cmd;
  try {
    cmd = JSON.parse(ev.data);
  } catch (e) {
    console.error('[mcp-bridge] bad command', ev.data, e);
    return;
  }
  if (!cmd || !cmd.id) return;
  let result = null;
  let error = null;
  try {
    result = await exec(cmd.tool, cmd.args || {});
  } catch (e) {
    error = e?.message || String(e);
  }
  try {
    await fetch('/api/mcp/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cmd.id, result, error }),
    });
  } catch (e) {
    console.error(`[mcp-bridge] result of ${cmd.tool} not delivered`, e);
  }
}

async function exec(tool, args) {
  // Ответ внешнего агента в чат Bulka — не требует редактора, просто прокидываем в UI чата.
  if (tool === 'chatReply') {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bulka-mcp-chat-reply', { detail: String(args.text ?? '') }));
    }
    return 'ок';
  }
  const editor = getEditorRef?.();
  if (!editor) throw new Error('Редактор Bulka ещё не готов');
  // Удобная связка set+play (в реестре её нет — это MCP-only комбинация двух тулзов).
  if (APP_TOOL_NAMES.has(tool)) {
    return execAppTool({ editor, ...(getActionsRef?.() || {}) }, tool, args);
  }
  if (tool === 'setCodeAndPlay') {
    await execClientTool(editor, 'setFullCode', args);
    const played = await execClientTool(editor, 'playMusic', {});
    if (!played.ok) throw new Error(played.data);
    return 'Код установлен и запущен.';
  }
  // Все остальные клиентские тулзы — через ЕДИНЫЙ исполнитель (тот же, что у встроенного агента).
  const res = await execClientTool(editor, tool, args);
  if (res.ok === false) throw new Error(res.data ?? res.message);
  return res.data ?? res.message;
}
