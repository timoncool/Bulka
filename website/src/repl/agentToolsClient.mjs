// ЕДИНЫЙ исполнитель КЛИЕНТСКИХ тулзов агента Bulka.
// Работают в окне приложения над живым редактором (editor), картой звуков и логами консоли.
// Один и тот же код используют И встроенный чат-агент (useChatContext), И внешний агент через
// MCP-мост (mcpBridge). Имена тулзов — канонические, как в реестре TOOLS_OPENAI (api/chat.ts).
//
// Серверные тулзы (searchDocs, getExamples) сюда НЕ входят — они чистые функции и считаются
// на сервере (api/chat.ts). Здесь — только то, что требует окна Bulka.

import { soundMap } from '@strudel/webaudio';
import { $strudel_log_history } from './components/useLogger.jsx';

// Список клиентских тулзов (для маршрутизации: клиент vs сервер).
export const CLIENT_TOOL_NAMES = [
  'readCode', 'setFullCode', 'editCode', 'appendCode', 'playMusic', 'stopMusic',
  'highlightCode', 'getAvailablePacks', 'getBankSamples', 'getConsole',
];

// Вставить мета-тег // @model после блока мета-комментариев (// @...), если его ещё нет.
function injectModelTag(code, modelTag) {
  if (!modelTag || code.includes('// @model')) return code;
  const lines = code.split('\n');
  let lastMetaIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*\/\/\s*@\w+/.test(lines[i])) lastMetaIdx = i;
    else if (lines[i].trim() !== '' && lastMetaIdx >= 0) break;
  }
  if (lastMetaIdx >= 0) {
    lines.splice(lastMetaIdx + 1, 0, `// @model ${modelTag}`);
    return lines.join('\n');
  }
  return code;
}

function formatPacks() {
  const sounds = soundMap.get();
  const packs = {};
  Object.entries(sounds || {})
    .filter(([key]) => !key.startsWith('_'))
    .forEach(([soundName, { data }]) => {
      const pack = data?.pack || 'other';
      if (!packs[pack]) packs[pack] = { banks: [], type: data?.type || 'sample', tag: data?.tag };
      packs[pack].banks.push(soundName);
    });
  const list = Object.entries(packs)
    .map(([packName, info]) => {
      const bankNames = info.banks.sort();
      const banksStr = bankNames.length <= 30
        ? bankNames.join(', ')
        : bankNames.slice(0, 10).join(', ') + `, ... и ещё ${bankNames.length - 10}`;
      return `• ${packName} (${info.banks.length} банков, ${info.type}${info.tag ? ', ' + info.tag : ''}):\n  Банки: ${banksStr}`;
    })
    .join('\n\n');
  return list || 'Паки не загружены.';
}

function formatBank(bankName) {
  if (!bankName) return '⚠ Не указан bankName.';
  const sounds = soundMap.get();
  const bankData = sounds?.[bankName];
  if (!bankData?.data) return `⚠ Банк "${bankName}" не найден.`;
  const { data } = bankData;
  if (data.type === 'sample' && data.samples) {
    const samplesList = Array.isArray(data.samples) ? data.samples : Object.values(data.samples).flat();
    let info = `Банк "${bankName}" (${data.pack || 'unknown'}):\nТип: ${data.type}\nСемплов: ${samplesList.length}\nФайлы:\n`;
    info += samplesList.slice(0, 20).map((s, i) => `  ${i}: ${s}`).join('\n');
    if (samplesList.length > 20) info += `\n  ... и ещё ${samplesList.length - 20} файлов`;
    return info;
  }
  return `Банк "${bankName}": тип ${data.type}, пак ${data.pack || 'unknown'}`;
}

function formatConsole() {
  const logs = $strudel_log_history.get() || [];
  if (!logs.length) return 'Консоль пуста - нет логов.';
  const formatted = logs
    .map((log, i) => {
      const countStr = log.count && log.count > 1 ? ` (x${log.count})` : '';
      const typeStr = log.type ? `[${log.type}]` : '';
      return `${i + 1}. ${typeStr} ${log.message}${countStr}`;
    })
    .join('\n');
  return `Логи консоли (последние ${logs.length}):\n${formatted}`;
}

/**
 * Исполнить клиентский тул. Возвращает { ok, message, data }:
 *  - message — короткий человекочитаемый статус (для UI встроенного чата),
 *  - data — результат для агента (текст кода/паков/логов) либо message для действий.
 * Бросает, если editor не готов или тул неизвестен.
 * @param editor StrudelMirror (editorRef.current)
 * @param name канонический tool name (readCode/setFullCode/...)
 * @param args аргументы; для setFullCode можно передать modelTag='provider/model'
 */
export function execClientTool(editor, name, args = {}) {
  if (!editor) throw new Error('Редактор Bulka ещё не готов');
  switch (name) {
    case 'readCode': {
      const code = editor.code || '';
      return { ok: true, message: '📖 Код прочитан', data: code || '// Редактор пуст' };
    }
    case 'setFullCode': {
      const code = injectModelTag(String(args.code ?? ''), args.modelTag);
      editor.setCode(code);
      return { ok: true, message: '✓ Код установлен в редактор', data: 'Код установлен.' };
    }
    case 'editCode': {
      const cur = editor.code || '';
      if (args.search && cur.includes(args.search)) {
        editor.setCode(cur.replace(args.search, String(args.replace ?? '')));
        return { ok: true, message: '✓ Код отредактирован', data: 'Код отредактирован.' };
      }
      return { ok: false, message: '⚠ Фрагмент не найден для замены', data: 'Фрагмент не найден.' };
    }
    case 'appendCode': {
      const cur = editor.code || '';
      editor.setCode(cur + (cur.endsWith('\n') ? '' : '\n') + String(args.code ?? ''));
      return { ok: true, message: '✓ Код добавлен', data: 'Код дописан.' };
    }
    case 'playMusic':
      editor.evaluate();
      return { ok: true, message: '▶ Воспроизведение запущено', data: 'Воспроизведение запущено.' };
    case 'stopMusic':
      editor.stop();
      return { ok: true, message: '⏹ Воспроизведение остановлено', data: 'Остановлено.' };
    case 'highlightCode': {
      const found = editor.selectText?.(args.search);
      return found
        ? { ok: true, message: '🔍 Код выделен', data: 'Код выделен.' }
        : { ok: false, message: '⚠ Фрагмент не найден', data: 'Фрагмент не найден.' };
    }
    case 'getAvailablePacks': {
      const data = formatPacks();
      return { ok: true, message: '📦 Паки получены', data };
    }
    case 'getBankSamples': {
      const data = formatBank(args.bankName);
      return { ok: true, message: `🎵 Банк ${args.bankName || ''}`, data };
    }
    case 'getConsole': {
      editor.stop(); // остановить, чтобы прочитать свежие логи
      const data = formatConsole();
      return { ok: true, message: '📋 Консоль прочитана', data };
    }
    default:
      throw new Error(`Неизвестный клиентский инструмент: ${name}`);
  }
}
