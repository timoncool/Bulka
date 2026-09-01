// Клиент MCP-моста (десктоп). Подписывается на SSE-канал Node-сервера, исполняет команды
// MCP-тулов через редактор Bulka и возвращает результат. Так внешний Claude Desktop / ChatGPT
// (через mcp-remote → /mcp → эта шина) реально управляют живым приложением.
// Активно ТОЛЬКО когда сайт раздаётся локально (десктоп: 127.0.0.1/localhost). На bulka.app — no-op.

let es = null;
let getEditorRef = null;
let installed = false;
const statusListeners = new Set();

export function installMcpBridge(getEditor, { autoStart = true } = {}) {
  if (typeof window === 'undefined') return;
  const host = location.hostname;
  if (host !== '127.0.0.1' && host !== 'localhost') return; // только десктоп
  getEditorRef = getEditor;
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
    } catch {
      /* ignore */
    }
  }
}

function start() {
  if (es || !getEditorRef) return;
  try {
    es = new EventSource('/api/mcp/events');
  } catch {
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
  } catch {
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
  } catch {
    /* сервер перезапустился — не критично */
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
  switch (tool) {
    case 'setCode':
      editor.setCode(String(args.code ?? ''));
      return 'Код установлен в редактор.';
    case 'setCodeAndPlay':
      editor.setCode(String(args.code ?? ''));
      editor.evaluate();
      return 'Код установлен и запущен.';
    case 'appendCode': {
      const cur = editor.code || '';
      editor.setCode(cur + (cur.endsWith('\n') ? '' : '\n') + String(args.code ?? ''));
      return 'Код дописан.';
    }
    case 'getCode':
      return editor.code || '';
    case 'play':
      editor.evaluate();
      return 'Воспроизведение запущено.';
    case 'stop':
      editor.stop();
      return 'Остановлено.';
    default:
      throw new Error(`Неизвестная команда: ${tool}`);
  }
}
