import { useState, useEffect } from 'react';
import cx from '@src/cx.mjs';

// Панель MCP-сервера (только десктоп). Внешний Claude Desktop / ChatGPT управляют этой Bulka:
// пишут код, играют, останавливают. Мост поднимается авто-стартом; тут — статус, старт/стоп/
// рестарт и готовый сниппет для claude_desktop_config.json.
function isDesktop() {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === '127.0.0.1' || h === 'localhost';
}

const btn =
  'px-2 py-1 text-sm rounded border border-foreground/30 hover:bg-lineBackground disabled:opacity-30 disabled:cursor-not-allowed';

export function McpPanel() {
  if (!isDesktop()) return null;

  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);

  const port = (typeof window !== 'undefined' && window.location.port) || '4188';
  const url = `http://127.0.0.1:${port}/mcp`;
  // Стандартный способ добавить HTTP-MCP (Claude Desktop / Cursor / Claude Code) — просто URL,
  // без команд, npx и коннекторов.
  const config = JSON.stringify({ mcpServers: { bulka: { type: 'streamable-http', url } } }, null, 2);

  // Статус подключения окна к мосту (опрос сервера).
  useEffect(() => {
    let alive = true;
    const check = () =>
      fetch('/api/mcp/result')
        .then((r) => r.json())
        .then((j) => alive && setConnected(!!j.connected))
        .catch(() => {});
    check();
    const t = setInterval(check, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.__bulkaMcp : null;
    if (api) setRunning(api.isConnected());
    const off = api?.onStatus?.((s) => setRunning(s === 'connected' || s === 'reconnecting'));
    return () => off?.();
  }, []);

  const start = () => {
    window.__bulkaMcp?.start();
    setRunning(true);
  };
  const stop = () => {
    window.__bulkaMcp?.stop();
    setRunning(false);
  };
  const restart = () => {
    window.__bulkaMcp?.restart();
    setRunning(true);
  };
  const copyText = async (text, mark) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(mark);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid gap-2 p-3 rounded-md border border-foreground/20">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm">🔌 MCP-сервер — управление из Claude Desktop / ChatGPT</span>
        <span
          className={cx(
            'text-xs px-2 py-0.5 rounded whitespace-nowrap',
            connected ? 'bg-green-500/20 text-green-400' : 'bg-foreground/10 opacity-70',
          )}
        >
          {connected ? '● окно подключено' : '○ окно не подключено'}
        </span>
      </div>
      <p className="text-xs opacity-70">
        Внешний AI (Claude Desktop / ChatGPT) может писать код и рулить музыкой в этой Bulka. Мост поднимается
        автоматически вместе с приложением и почти не ест ресурсов.
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={start} disabled={running} className={btn}>
          Запустить
        </button>
        <button onClick={stop} disabled={!running} className={btn}>
          Остановить
        </button>
        <button onClick={restart} className={btn}>
          Перезапустить
        </button>
        <span className="text-xs opacity-60">{running ? 'мост активен' : 'мост остановлен'}</span>
      </div>
      <div className="grid gap-1">
        <label className="text-xs opacity-70">
          Добавь в <code>claude_desktop_config.json</code> (или в конфиг Cursor / другого MCP-клиента) и перезапусти
          его. Это HTTP-MCP по адресу — никаких команд, npx и мостов ставить не нужно, Bulka уже держит сервер:
        </label>
        <pre className="text-xs bg-background p-2 rounded overflow-x-auto border border-foreground/20 whitespace-pre">
          {config}
        </pre>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => copyText(config, 'config')} className={cx(btn, 'whitespace-nowrap')}>
            {copied === 'config' ? '✓ скопировано' : 'Копировать конфиг'}
          </button>
          <button onClick={() => copyText(url, 'url')} className={cx(btn, 'whitespace-nowrap')}>
            {copied === 'url' ? '✓' : 'Копировать только адрес'}
          </button>
          <span className="text-xs opacity-60">
            Claude Code: <code>claude mcp add --transport http bulka {url}</code>
          </span>
        </div>
      </div>
    </div>
  );
}
