/**
 * useChatContext - Hook for managing AI chat state
 *
 * Uses server-side RAG for documentation search.
 * API key stored in localStorage and sent with each request.
 * бесплатный AI (OVHcloud) uses client-side library (no API key needed).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettings } from '../settings.mjs';
import { soundMap } from '@strudel/webaudio';
import { $strudel_log_history } from './components/useLogger.jsx';

// Бесплатный AI БЕЗ авторизации/ключа: OVHcloud AI Endpoints (OpenAI-совместимый,
// открытый CORS, стриминг). Проверено из браузера — gpt-oss отвечает и стримит.
// Другие бесплатные варианты отпали (требуют proof-of-work, вход в аккаунт
// или капчу из браузера). OVHcloud — единственный рабочий без авторизации.
// Ограничение бесплатного тарифа: 2 запроса в минуту на IP (отдаём понятную ошибку при 429).
export const FREE_AI_ENDPOINT = 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions';
export const FREE_AI_MODELS_ENDPOINT = 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models';
export const FREE_AI_DEFAULT_MODEL = 'gpt-oss-20b';

/**
 * Бесплатный чат без ключа/авторизации (OVHcloud AI Endpoints, OpenAI-совместимый, стриминг).
 * @param {Array} messages
 * @param {string} model
 * @param {string} subProvider — не используется (оставлен для совместимости сигнатуры)
 * @param {Function} onStatus
 */
async function* runFreeClientChat(messages, model, subProvider, onStatus) {
  onStatus?.('🔗 Бесплатный AI (OVHcloud)...');
  try {
    const resp = await fetch(FREE_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || FREE_AI_DEFAULT_MODEL,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    if (resp.status === 429) {
      yield {
        type: 'error',
        error: 'Бесплатный лимит: не больше 2 запросов в минуту на этот IP. Подожди ~30 секунд и попробуй снова — либо укажи свой ключ / выбери OpenRouter.',
      };
      return;
    }
    if (!resp.ok || !resp.body) {
      yield { type: 'error', error: `Бесплатный AI недоступен (${resp.status}). Попробуй позже или используй свой ключ / OpenRouter.` };
      return;
    }

    onStatus?.('📡 Получаю ответ...');
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const s = line.trim();
        if (!s.startsWith('data:')) continue;
        const data = s.slice(5).trim();
        if (data === '[DONE]') return;
        try {
          const j = JSON.parse(data);
          const content = j.choices?.[0]?.delta?.content;
          if (content) yield { type: 'text', content };
        } catch {
          /* пропускаем незавершённый чанк */
        }
      }
    }
  } catch (error) {
    yield { type: 'error', error: error?.message || 'Ошибка бесплатного AI' };
  }
}

const CHAT_STORAGE_KEY = 'bulka-chat-messages';
const CHAT_DRAFT_KEY = 'bulka-chat-draft';

/**
 * Load messages from localStorage
 */
function loadMessagesFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Chat] Failed to load messages from storage:', e);
  }
  return [];
}

/**
 * Save messages to localStorage
 */
function saveMessagesToStorage(messages) {
  if (typeof window === 'undefined') return;
  try {
    // Limit to last 50 messages to avoid storage overflow
    const toSave = messages.slice(-50);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('[Chat] Failed to save messages to storage:', e);
  }
}

/**
 * Load draft message from localStorage
 */
function loadDraftFromStorage() {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(CHAT_DRAFT_KEY) || '';
  } catch (e) {
    console.warn('[Chat] Failed to load draft from storage:', e);
    return '';
  }
}

/**
 * Save draft message to localStorage
 */
function saveDraftToStorage(draft) {
  if (typeof window === 'undefined') return;
  try {
    if (draft) {
      localStorage.setItem(CHAT_DRAFT_KEY, draft);
    } else {
      localStorage.removeItem(CHAT_DRAFT_KEY);
    }
  } catch (e) {
    console.warn('[Chat] Failed to save draft to storage:', e);
  }
}

/**
 * Generate unique message ID
 */
function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse SSE stream from agent API
 * Handles both text and tool_call messages
 */
async function* parseAgentStream(reader) {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          // Yield the parsed message (could be text or tool_call)
          yield parsed;
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * Extract code blocks from AI response
 */
function extractCodeBlocks(text) {
  const codeBlockRegex = /```(?:javascript|js|strudel)?\n?([\s\S]*?)```/g;
  const blocks = [];
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/**
 * бесплатный AI (OVHcloud) System Prompt with action descriptors
 * Since бесплатный AI (OVHcloud) doesn't support tools, we use text-based action markers
 */
const FREE_SYSTEM_PROMPT = `Ты Bulka AI - помощник для музыкального live-coding на Strudel.

ВАЖНО: Ты работаешь через бесплатный AI (OVHcloud) без поддержки инструментов. Используй специальные маркеры действий:

## ДОСТУПНЫЕ ДЕЙСТВИЯ:

1. **Установить код** - оберни код в блок:
\`\`\`javascript
// твой код тут
\`\`\`

2. **Запустить воспроизведение** - добавь после кода:
[PLAY]

3. **Остановить воспроизведение**:
[STOP]

## ПРАВИЛА:
- Всегда давай ПОЛНЫЙ рабочий код, не фрагменты
- После написания кода ВСЕГДА добавляй [PLAY] чтобы запустить музыку
- Код должен быть валидным Strudel/Tidal кодом
- Используй stack() для нескольких партий одновременно
- Будь кратким в объяснениях (1-2 предложения)

## ПРИМЕР ОТВЕТА:
Вот простой бит:
\`\`\`javascript
stack(
  s("bd sd bd sd"),
  s("hh*8")
)
\`\`\`
[PLAY]
`;

/**
 * Parse бесплатный AI (OVHcloud) action markers from response
 * Returns: { actions: Array<{type, args}>, cleanContent: string }
 */
function parseFreeActions(content) {
  const actions = [];
  let cleanContent = content;

  // Parse [PLAY] marker
  if (/\[PLAY\]/i.test(content)) {
    actions.push({ type: 'playMusic' });
    cleanContent = cleanContent.replace(/\[PLAY\]/gi, '').trim();
  }

  // Parse [STOP] marker
  if (/\[STOP\]/i.test(content)) {
    actions.push({ type: 'stopMusic' });
    cleanContent = cleanContent.replace(/\[STOP\]/gi, '').trim();
  }

  return { actions, cleanContent };
}

/**
 * Main chat hook
 */
export function useChatContext(replContext) {
  const settings = useSettings();
  const [messages, setMessages] = useState(() => loadMessagesFromStorage());
  const [input, setInput] = useState(() => loadDraftFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null); // Для показа hint'ов с автоскрытием
  const [editorError, setEditorError] = useState(null); // Ошибки из редактора
  const abortControllerRef = useRef(null);
  const lastActionTimeoutRef = useRef(null);

  // Save messages to localStorage when they change
  useEffect(() => {
    // Only save if there are messages with content
    const messagesWithContent = messages.filter(m => m.content);
    if (messagesWithContent.length > 0) {
      saveMessagesToStorage(messagesWithContent);
    }
  }, [messages]);

  // Save draft to localStorage when input changes
  useEffect(() => {
    saveDraftToStorage(input);
  }, [input]);

  // Автоскрытие lastAction hint через 3 секунды
  useEffect(() => {
    if (lastAction) {
      if (lastActionTimeoutRef.current) {
        clearTimeout(lastActionTimeoutRef.current);
      }
      lastActionTimeoutRef.current = setTimeout(() => {
        setLastAction(null);
      }, 3000);
    }
    return () => {
      if (lastActionTimeoutRef.current) {
        clearTimeout(lastActionTimeoutRef.current);
      }
    };
  }, [lastAction]);

  // Ответы внешнего агента (MCP) -> показываем как сообщения ассистента в чате.
  useEffect(() => {
    const onReply = (e) => {
      const text = typeof e.detail === 'string' ? e.detail : '';
      setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: text }]);
    };
    if (typeof window !== 'undefined') window.addEventListener('bulka-mcp-chat-reply', onReply);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('bulka-mcp-chat-reply', onReply);
    };
  }, []);

  /**
   * Apply code to editor
   */
  const applyCode = useCallback((code) => {
    if (replContext?.editorRef?.current) {
      replContext.editorRef.current.setCode(code);
      setLastAction('✓ Код применён');
    }
  }, [replContext]);

  /**
   * Apply code and run it
   */
  const applyAndRun = useCallback((code) => {
    if (replContext?.editorRef?.current) {
      replContext.editorRef.current.setCode(code);
      replContext.editorRef.current.evaluate();
      setLastAction('▶ Код применён и запущен');
    }
  }, [replContext]);

  /**
   * Get current code from editor
   */
  const getCurrentCode = useCallback(() => {
    return replContext?.editorRef?.current?.code || '';
  }, [replContext]);

  /**
   * Play/evaluate the code
   */
  const play = useCallback(() => {
    if (replContext?.editorRef?.current) {
      replContext.editorRef.current.evaluate();
    }
  }, [replContext]);

  /**
   * Stop playback
   */
  const stopPlayback = useCallback(() => {
    if (replContext?.editorRef?.current) {
      replContext.editorRef.current.stop();
    }
  }, [replContext]);

  /**
   * Toggle play/stop
   */
  const togglePlayback = useCallback(() => {
    if (replContext?.editorRef?.current) {
      replContext.editorRef.current.toggle();
    }
  }, [replContext]);

  /**
   * Check if currently playing
   */
  const isPlaying = replContext?.started || false;

  /**
   * Send message to AI
   */
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    const { aiProvider, aiModel, openaiApiKey, anthropicApiKey, geminiApiKey } = settings;

    // Провайдер «Внешний агент (MCP)»: сообщение уходит внешнему Claude/ChatGPT (через MCP),
    // ответ придёт событием bulka-mcp-chat-reply. Внутренний LLM тут не вызывается.
    if (aiProvider === 'mcp') {
      const um = { id: generateId(), role: 'user', content: content.trim() };
      setMessages((prev) => [...prev, um]);
      setInput('');
      fetch('/api/mcp/chat-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content.trim() }),
      }).catch(() => {});
      setLastAction('📤 Отправлено внешнему агенту (MCP) — жду ответа…');
      return;
    }

    // free doesn't need API key
    const isFree = aiProvider === 'free';
    const isLocal = aiProvider === 'local';

    // Get API key for current provider (не нужен для free; для local опционален)
    const aiApiKey = isFree ? null :
                     isLocal ? (settings.localApiKey || '') :
                     aiProvider === 'openai' ? openaiApiKey :
                     aiProvider === 'anthropic' ? anthropicApiKey :
                     aiProvider === 'gemini' ? geminiApiKey :
                     aiProvider === 'zai' ? settings.zaiApiKey :
                     aiProvider === 'openrouter' ? settings.openrouterApiKey : '';

    if (!isFree && !isLocal && !aiApiKey) {
      setError(`API ключ для ${aiProvider} не установлен. Откройте настройки и добавьте ключ.`);
      return;
    }

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
    };

    const assistantMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');

    try {
      // Get current code from editor
      const editor = replContext?.editorRef?.current;
      const currentCode = editor?.code || '';
      const selectedCode = editor?.getSelection?.() || null;

      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      abortControllerRef.current = new AbortController();

      let fullContent = '';
      let thinkingContent = '';
      let isThinking = false;
      let actionsExecuted = [];

      // бесплатный AI (OVHcloud): use client-side handler with real-time action parsing
      if (isFree) {
        // Build system prompt with code context
        const codeContext = currentCode
          ? (selectedCode
              ? `\n\n## ТЕКУЩИЙ КОД В РЕДАКТОРЕ:\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\n## ВЫДЕЛЕННЫЙ ФРАГМЕНТ:\n\`\`\`javascript\n${selectedCode}\n\`\`\``
              : `\n\n## ТЕКУЩИЙ КОД В РЕДАКТОРЕ:\n\`\`\`javascript\n${currentCode}\n\`\`\``)
          : '';

        const freeMessages = [
          { role: 'system', content: FREE_SYSTEM_PROMPT + codeContext },
          ...apiMessages,
        ];

        const editor = replContext?.editorRef?.current;

        for await (const message of runFreeClientChat(freeMessages, aiModel, null, setLastAction)) {
          if (message.type === 'text' && message.content) {
            fullContent += message.content;

            // Update displayed message during streaming (clean markers for display)
            const displayContent = fullContent
              .replace(/\[PLAY\]/gi, '')
              .replace(/\[STOP\]/gi, '')
              .trim();

            setMessages(prev => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (updated[lastIdx]?.role === 'assistant') {
                updated[lastIdx] = { ...updated[lastIdx], content: displayContent };
              }
              return updated;
            });
          } else if (message.type === 'error') {
            throw new Error(message.error);
          }
        }

        // === После завершения стриминга - обработка кода и действий ===
        if (editor) {
          // Применяем код
          const codeBlocks = extractCodeBlocks(fullContent);
          if (codeBlocks.length > 0) {
            let code = codeBlocks[codeBlocks.length - 1];
            // Add @model meta tag if not already present
            if (!code.includes('// @model')) {
              const modelTag = `// @model ${aiProvider}/${aiModel}`;
              const lines = code.split('\n');
              let lastMetaIdx = -1;
              for (let i = 0; i < lines.length; i++) {
                if (/^\s*\/\/\s*@\w+/.test(lines[i])) {
                  lastMetaIdx = i;
                } else if (lines[i].trim() !== '' && lastMetaIdx >= 0) {
                  break;
                }
              }
              if (lastMetaIdx >= 0) {
                lines.splice(lastMetaIdx + 1, 0, modelTag);
                code = lines.join('\n');
              }
            }
            editor.setCode(code);
            actionsExecuted.push('Код установлен');
            setLastAction('✓ Код применён в редактор');
          }

          // Проверяем маркеры [PLAY]/[STOP]
          const hasPlay = /\[PLAY\]/i.test(fullContent);
          const hasStop = /\[STOP\]/i.test(fullContent);

          if (hasStop) {
            editor.stop();
            actionsExecuted.push('Воспроизведение остановлено');
            setLastAction('⏹ Воспроизведение остановлено');
          } else if (hasPlay) {
            editor.evaluate();
            actionsExecuted.push('Воспроизведение запущено');
            setLastAction('▶ Воспроизведение запущено');
          } else if (codeBlocks.length > 0) {
            // Авто-плей если код есть но нет маркеров
            editor.evaluate();
            actionsExecuted.push('Воспроизведение запущено (авто)');
            setLastAction('▶ Воспроизведение запущено (авто)');
          }
        }

        // Final update with action summary (only once)
        const cleanContent = fullContent
          .replace(/\[PLAY\]/gi, '')
          .replace(/\[STOP\]/gi, '')
          .trim();

        if (actionsExecuted.length > 0) {
          const actionSummary = `\n\n✓ ${actionsExecuted.join(', ')}`;
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              // Only add summary if not already present
              const currentContent = updated[lastIdx].content || '';
              if (!currentContent.includes('✓ ')) {
                updated[lastIdx] = { ...updated[lastIdx], content: cleanContent + actionSummary };
              }
            }
            return updated;
          });
        }

        // Done with free
        setIsLoading(false);
        return;
      }

      // Other providers: use server-side API
      // Retry logic with exponential backoff for rate limits
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      const baseDelay = 2000; // 2 seconds

      // OpenRouter: strict-тулы только если выбранная модель поддерживает structured_outputs
      // (метаданные модели лежат в кэше моделей ChatTab).
      let openrouterStrictTools = false;
      if (aiProvider === 'openrouter') {
        try {
          const cachedModels = JSON.parse(localStorage.getItem('bulka_cached_models') || '{}');
          const mi = (cachedModels.openrouter || []).find((x) => x.value === aiModel);
          openrouterStrictTools = !!(mi?.supportedParameters || []).includes('structured_outputs');
        } catch {
          /* no-op */
        }
      }

      while (retryCount <= maxRetries) {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            apiKey: aiApiKey,
            provider: aiProvider,
            model: aiModel,
            currentCode,
            selectedCode, // Send selected code if any
            // Параметры конкретной модели OpenRouter (temperature/reasoning_effort/top_p/max_tokens)
            modelParams: aiProvider === 'openrouter' ? (settings.openrouterModelParams?.[aiModel] || {})
              : aiProvider === 'local' ? (settings.localModelParams || {})
              : undefined,
            // strict-тулы для OpenRouter — только для моделей с structured_outputs
            strictTools: aiProvider === 'openrouter' ? openrouterStrictTools : undefined,
            // Локальная модель: адрес OpenAI-совместимого сервера (LM Studio / Ollama)
            localBaseUrl: aiProvider === 'local' ? (settings.localBaseUrl || 'http://localhost:1234/v1') : undefined,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (response.ok) break;

        const errData = await response.json().catch(() => ({}));
        const errorStr = errData.error || JSON.stringify(errData) || '';

        // Check for rate limit error
        if (response.status === 429 || errorStr.includes('rate_limit') || errorStr.includes('rate limit')) {
          retryCount++;
          if (retryCount <= maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount - 1); // 2s, 4s, 8s
            setLastAction(`⏳ Rate limit, повтор через ${delay / 1000}с... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      // Parse streaming response from agent
      const reader = response.body.getReader();

      for await (const message of parseAgentStream(reader)) {
        // Handle status messages (show what agent is doing)
        if (message.type === 'status') {
          setLastAction(message.message);
          continue;
        }

        // Handle thinking start
        if (message.type === 'thinking_start') {
          isThinking = true;
          thinkingContent = '';
          setLastAction('🧠 Думаю...');
          continue;
        }

        // Handle thinking content (stream thinking process)
        if (message.type === 'thinking' && message.content) {
          thinkingContent += message.content;
          // Update message with thinking content (показываем мысли)
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: `💭 *${thinkingContent}*`,
                isThinking: true,
              };
            }
            return updated;
          });
          continue;
        }

        // Handle thinking end
        if (message.type === 'thinking_end') {
          isThinking = false;
          // Clear thinking content from message, prepare for real response
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: '',
                thinking: thinkingContent, // Save thinking for reference
                isThinking: false,
              };
            }
            return updated;
          });
          setLastAction('✓ Готово думать');
          continue;
        }

        // Handle tool calls from agent
        if (message.type === 'tool_call') {
          const { name, args } = message;
          const editor = replContext?.editorRef?.current;

          if (!editor) continue;

          // setFullCode - полная замена кода
          if (name === 'setFullCode' && args?.code) {
            let code = args.code;
            // Add @model meta tag if not already present
            if (!code.includes('// @model')) {
              const modelTag = `// @model ${aiProvider}/${aiModel}`;
              // Insert after last meta comment line (// @...)
              const lines = code.split('\n');
              let lastMetaIdx = -1;
              for (let i = 0; i < lines.length; i++) {
                if (/^\s*\/\/\s*@\w+/.test(lines[i])) {
                  lastMetaIdx = i;
                } else if (lines[i].trim() !== '' && lastMetaIdx >= 0) {
                  break;
                }
              }
              if (lastMetaIdx >= 0) {
                lines.splice(lastMetaIdx + 1, 0, modelTag);
                code = lines.join('\n');
              }
            }
            editor.setCode(code);
            setLastAction('✓ Код установлен в редактор');
            actionsExecuted.push('Код установлен');
          }
          // editCode - найти и заменить фрагмент
          else if (name === 'editCode' && args?.search && args?.replace !== undefined) {
            const currentCode = editor.code || '';
            if (currentCode.includes(args.search)) {
              const newCode = currentCode.replace(args.search, args.replace);
              editor.setCode(newCode);
              setLastAction('✓ Код отредактирован');
              actionsExecuted.push('Код отредактирован');
            } else {
              setLastAction('⚠ Фрагмент не найден для замены');
              actionsExecuted.push('Фрагмент не найден');
            }
          }
          // appendCode - добавить в конец
          else if (name === 'appendCode' && args?.code) {
            const currentCode = editor.code || '';
            const newCode = currentCode + '\n' + args.code;
            editor.setCode(newCode);
            setLastAction('✓ Код добавлен');
            actionsExecuted.push('Код добавлен');
          }
          // playMusic - запустить
          else if (name === 'playMusic') {
            editor.evaluate();
            setLastAction('▶ Воспроизведение запущено');
            actionsExecuted.push('Воспроизведение запущено');
          }
          // stopMusic - остановить
          else if (name === 'stopMusic') {
            editor.stop();
            setLastAction('⏹ Воспроизведение остановлено');
            actionsExecuted.push('Воспроизведение остановлено');
          }
          // highlightCode - выделить фрагмент кода
          else if (name === 'highlightCode' && args?.search) {
            const found = editor.selectText?.(args.search);
            if (found) {
              setLastAction('🔍 Код выделен');
              actionsExecuted.push('Код выделен');
            } else {
              setLastAction('⚠ Фрагмент не найден');
              actionsExecuted.push('Фрагмент не найден');
            }
          }
          // getAvailablePacks - получить список всех паков
          else if (name === 'getAvailablePacks') {
            const sounds = soundMap.get();
            const packs = {};
            Object.entries(sounds || {})
              .filter(([key]) => !key.startsWith('_'))
              .forEach(([soundName, { data }]) => {
                const pack = data?.pack || 'other';
                if (!packs[pack]) {
                  packs[pack] = { banks: [], type: data?.type || 'sample', tag: data?.tag };
                }
                packs[pack].banks.push(soundName);
              });
            // Формируем читаемый ответ для агента с названиями банков
            const packsList = Object.entries(packs)
              .map(([packName, info]) => {
                const bankNames = info.banks.sort();
                // Для небольших паков (до 30 банков) показываем все названия
                // Для больших - только первые 10 + счётчик
                let banksStr;
                if (bankNames.length <= 30) {
                  banksStr = bankNames.join(', ');
                } else {
                  banksStr = bankNames.slice(0, 10).join(', ') + `, ... и ещё ${bankNames.length - 10}`;
                }
                return `• ${packName} (${info.banks.length} банков, ${info.type}${info.tag ? ', ' + info.tag : ''}):\n  Банки: ${banksStr}`;
              })
              .join('\n\n');
            setLastAction(`📦 Найдено ${Object.keys(packs).length} паков`);
            actionsExecuted.push(`Паки: ${Object.keys(packs).join(', ')}`);
            // Store pack info for agent context
            message.packResult = packsList;
          }
          // getBankSamples - получить содержимое конкретного банка
          else if (name === 'getBankSamples' && args?.bankName) {
            const sounds = soundMap.get();
            const bankData = sounds?.[args.bankName];
            if (bankData?.data) {
              const { data } = bankData;
              let samplesInfo = '';
              if (data.type === 'sample' && data.samples) {
                const samplesList = Array.isArray(data.samples) ? data.samples : Object.values(data.samples).flat();
                samplesInfo = `Банк "${args.bankName}" (${data.pack || 'unknown'}):\n`;
                samplesInfo += `Тип: ${data.type}\n`;
                samplesInfo += `Семплов: ${samplesList.length}\n`;
                samplesInfo += `Файлы:\n${samplesList.slice(0, 20).map((s, i) => `  ${i}: ${s}`).join('\n')}`;
                if (samplesList.length > 20) {
                  samplesInfo += `\n  ... и ещё ${samplesList.length - 20} файлов`;
                }
              } else {
                samplesInfo = `Банк "${args.bankName}": тип ${data.type}, пак ${data.pack || 'unknown'}`;
              }
              setLastAction(`🎵 Банк ${args.bankName} найден`);
              actionsExecuted.push(`Банк ${args.bankName}: ${data.samples?.length || 0} семплов`);
              message.bankResult = samplesInfo;
            } else {
              setLastAction(`⚠ Банк ${args.bankName} не найден`);
              actionsExecuted.push(`Банк ${args.bankName} не найден`);
            }
          }
          // getConsole - получить логи консоли для отладки
          else if (name === 'getConsole') {
            // Сначала останавливаем воспроизведение
            editor.stop();
            setLastAction('⏹ Остановлено для чтения консоли');

            // Получаем логи из истории
            const logs = $strudel_log_history.get() || [];

            if (logs.length === 0) {
              message.consoleResult = 'Консоль пуста - нет логов.';
              actionsExecuted.push('Консоль: пуста');
            } else {
              // Форматируем логи для агента
              const formattedLogs = logs.map((log, i) => {
                const countStr = log.count && log.count > 1 ? ` (x${log.count})` : '';
                const typeStr = log.type ? `[${log.type}]` : '';
                return `${i + 1}. ${typeStr} ${log.message}${countStr}`;
              }).join('\n');

              message.consoleResult = `Логи консоли (последние ${logs.length}):\n${formattedLogs}`;
              setLastAction(`📋 Консоль: ${logs.length} записей`);
              actionsExecuted.push(`Консоль: ${logs.length} записей`);
            }
          }
        }
        // Handle text content
        else if (message.type === 'text' && message.content) {
          fullContent += message.content;
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: fullContent };
            }
            return updated;
          });
        }
        // Handle errors from SSE stream
        else if (message.type === 'error' && message.error) {
          throw new Error(message.error);
        }
        // Handle legacy error format
        else if (message.error) {
          throw new Error(message.error);
        }
      }

      // Add action summary to message if tools were executed
      if (actionsExecuted.length > 0 && fullContent) {
        const actionSummary = `\n\n✓ ${actionsExecuted.join(', ')}`;
        fullContent += actionSummary;
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: fullContent };
          }
          return updated;
        });
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Chat] Aborted');
      } else {
        console.error('[Chat] Error:', err);
        setError(err.message);
        // Remove empty assistant message
        setMessages(prev => prev.filter(m => m.content));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, settings, replContext]);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  const handleKeyDown = useCallback((e) => {
    // Ctrl+Shift+Enter - отправить (для многострочного ввода)
    if (e.key === 'Enter' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
      return;
    }
    // Enter без модификаторов - отправить (если не в textarea или shift не нажат)
    if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  /**
   * Отправить ошибку редактора в чат для исправления
   */
  const sendEditorError = useCallback((errorMessage) => {
    if (!errorMessage || isLoading) return;
    setEditorError(errorMessage);
    const prompt = `Произошла ошибка при выполнении кода:\n\`\`\`\n${errorMessage}\n\`\`\`\n\nПожалуйста, исправь код.`;
    sendMessage(prompt);
  }, [sendMessage, isLoading]);

  /**
   * Получить текущее состояние воспроизведения
   */
  const getPlaybackState = useCallback(() => {
    return {
      isPlaying: replContext?.started || false,
      hasError: !!editorError,
      lastError: editorError,
    };
  }, [replContext?.started, editorError]);

  return {
    messages,
    input,
    isLoading,
    error,
    sendMessage,
    stop,
    clearMessages,
    setInput,
    handleInputChange,
    handleSubmit,
    handleKeyDown,
    // Settings for UI - check current provider's key (free и mcp не нужен ключ)
    hasApiKey: settings.aiProvider === 'free' || settings.aiProvider === 'mcp' || settings.aiProvider === 'local' ? true :
               !!(settings.aiProvider === 'openai' ? settings.openaiApiKey :
                  settings.aiProvider === 'anthropic' ? settings.anthropicApiKey :
                  settings.aiProvider === 'gemini' ? settings.geminiApiKey :
                  settings.aiProvider === 'zai' ? settings.zaiApiKey :
                  settings.aiProvider === 'openrouter' ? settings.openrouterApiKey : ''),
    provider: settings.aiProvider,
    model: settings.aiModel,
    // Error handling
    setError,
    // Action hints (автоскрытие через 3 сек)
    lastAction,
    setLastAction,
    // Code editing
    applyCode,
    applyAndRun,
    getCurrentCode,
    // Playback control
    play,
    stopPlayback,
    togglePlayback,
    isPlaying: replContext?.started || false,
    // Editor error handling
    editorError,
    setEditorError,
    sendEditorError,
    getPlaybackState,
  };
}

export default useChatContext;
