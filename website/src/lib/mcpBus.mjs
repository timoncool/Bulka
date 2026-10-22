// Шина MCP-моста (десктоп). Живёт на уровне модуля => одно состояние на процесс Node-сервера.
// Держит SSE-подписчиков (окно Bulka) и ожидающие вызовы тулов. MCP-роут кладёт команду сюда,
// вебвью (mcpBridge) исполняет её через редактор и возвращает результат, роут его отдаёт клиенту.

let seq = 0;
const subscribers = new Set(); // { send(cmd) }
const pending = new Map(); // id -> { resolve, timer }
const subscriberWaiters = new Set();

// Окно подключается к SSE через пару секунд после старта и переподключается после перезагрузки страницы.
const WINDOW_WAIT_MS = 8000;

export function addSubscriber(sub) {
  subscribers.add(sub);
  for (const wake of subscriberWaiters) wake();
  subscriberWaiters.clear();
  return () => subscribers.delete(sub);
}

function windowConnected() {
  if (subscribers.size > 0) return Promise.resolve(true);
  return new Promise((resolve) => {
    const wake = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      subscriberWaiters.delete(wake);
      resolve(false);
    }, WINDOW_WAIT_MS);
    subscriberWaiters.add(wake);
  });
}

export function subscriberCount() {
  return subscribers.size;
}

// Отправить команду в окно Bulka и дождаться результата (или таймаут).
export async function callBridge(tool, args, timeoutMs = 20000) {
  if (!(await windowConnected())) {
    return { error: 'Окно Bulka не подключено. Открой приложение Bulka и повтори.' };
  }
  return new Promise((resolve) => {
    const id = `c${++seq}`;
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve({ error: `Таймаут выполнения «${tool}»` });
    }, timeoutMs);
    pending.set(id, { resolve, timer });
    const cmd = { id, tool, args: args || {} };
    for (const sub of subscribers) {
      try {
        sub.send(cmd);
      } catch {
        /* подписчик мёртв — почистится при disconnect */
      }
    }
  });
}

// Вебвью прислал результат исполнения команды.
export function deliverResult(id, result, error) {
  const p = pending.get(id);
  if (!p) return false;
  clearTimeout(p.timer);
  pending.delete(id);
  p.resolve({ result, error });
  return true;
}

// --- Чат через MCP: юзер пишет в чат Bulka -> внешний агент читает и отвечает ---

const chatInbox = []; // сообщения юзера, ожидающие прочтения внешним агентом

// Юзер отправил сообщение из чата Bulka (провайдер «Внешний агент (MCP)»).
export function pushUserMessage(text) {
  chatInbox.push({ text: String(text ?? ''), ts: Date.now() });
  if (chatInbox.length > 100) chatInbox.shift();
}

// Внешний агент забирает новые сообщения юзера (и очищает очередь).
export function takeUserMessages() {
  const out = chatInbox.splice(0, chatInbox.length);
  return out;
}

// Внешний агент пишет ответ в чат Bulka -> доставляем в окно как команду chatReply.
export function sendChatReply(text) {
  const cmd = { id: `chat${++seq}`, tool: 'chatReply', args: { text: String(text ?? '') } };
  let delivered = 0;
  for (const sub of subscribers) {
    try {
      sub.send(cmd);
      delivered++;
    } catch {
      /* ignore */
    }
  }
  return delivered > 0;
}
