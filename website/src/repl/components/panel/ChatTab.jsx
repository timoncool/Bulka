/**
 * ChatTab - AI Assistant Chat Interface
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import cx from '@src/cx.mjs';
import ReactMarkdown from 'react-markdown';
import { useChatContext } from '../../useChatContext';
import { useSettings, setOpenaiApiKey, setAnthropicApiKey, setGeminiApiKey, setAiProvider, setAiModel, setGpt4freeSubProvider, getApiKeyForProvider } from '../../../settings.mjs';

// Common input styles matching SettingsTab
const inputClass = 'w-full p-2 bg-background rounded-md text-foreground border border-foreground/30 focus:border-foreground focus:outline-none';
const selectClass = 'w-full p-2 bg-background rounded-md text-foreground border border-foreground/30';
const buttonClass = 'px-4 py-2 rounded-md bg-background text-foreground border border-foreground/30 hover:bg-lineBackground disabled:opacity-50';

const SUGGESTIONS = [
  { label: 'Простой бит', prompt: 'Создай простой бит с бочкой, снейром и хэтом' },
  { label: 'Добавь бас', prompt: 'Добавь басовую линию к текущему треку' },
  { label: 'Объясни код', prompt: 'Объясни что делает текущий код' },
  { label: 'Добавь эффект', prompt: 'Добавь реверберацию и задержку' },
];

// Fallback models (used if API fetch fails)
const FALLBACK_MODELS = {
  openai: [{ value: 'gpt-4o', label: 'gpt-4o' }],
  anthropic: [{ value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' }],
  gemini: [{ value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }],
  gpt4free: [], // Загружается динамически через client.models.list()
};

const MODELS_STORAGE_KEY = 'bulka_cached_models';

/**
 * Load cached models from localStorage
 */
function loadCachedModels() {
  try {
    const cached = localStorage.getItem(MODELS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        openai: parsed.openai || FALLBACK_MODELS.openai,
        anthropic: parsed.anthropic || FALLBACK_MODELS.anthropic,
        gemini: parsed.gemini || FALLBACK_MODELS.gemini,
        gpt4free: FALLBACK_MODELS.gpt4free, // Always hardcoded
      };
    }
  } catch (e) {
    console.error('Error loading cached models:', e);
  }
  // Return default with gpt4free models
  return {
    openai: FALLBACK_MODELS.openai,
    anthropic: FALLBACK_MODELS.anthropic,
    gemini: FALLBACK_MODELS.gemini,
    gpt4free: FALLBACK_MODELS.gpt4free,
  };
}

/**
 * Save models to localStorage
 */
function saveCachedModels(models) {
  try {
    localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models));
  } catch (e) {
    console.error('Error saving models to cache:', e);
  }
}

/**
 * Fetch available models from provider API
 */
async function fetchModels(provider, apiKey) {
  // gpt4free: fetch models client-side from g4f.dev
  if (provider === 'gpt4free') {
    return fetchGpt4freeModels();
  }

  if (!apiKey) return null;
  try {
    const response = await fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.models || null;
  } catch (e) {
    console.error('Error fetching models:', e);
    return null;
  }
}

// GPT4Free providers module (lazy loaded)
let g4fProvidersModule = null;
let g4fClientsCache = {};

/**
 * Load g4f providers module from CDN
 */
async function loadG4fProviders() {
  if (!g4fProvidersModule) {
    g4fProvidersModule = await import('https://g4f.dev/dist/js/providers.js');
  }
  return g4fProvidersModule;
}

/**
 * Fetch list of gpt4free providers
 */
async function fetchGpt4freeProviders() {
  try {
    const module = await loadG4fProviders();
    const providers = module.default; // providers object

    // Convert to array and format
    return Object.keys(providers).map(key => ({
      value: key,
      label: key === 'default' ? 'Auto (default)' : key,
    }));
  } catch (e) {
    console.error('Error fetching gpt4free providers:', e);
    return [{ value: 'default', label: 'Auto (default)' }];
  }
}

/**
 * Fetch gpt4free models for specific provider
 */
async function fetchGpt4freeModels(subProvider = 'default') {
  try {
    const module = await loadG4fProviders();
    const { createClient } = module;

    // Get or create client for this provider
    if (!g4fClientsCache[subProvider]) {
      g4fClientsCache[subProvider] = createClient(subProvider);
    }
    const client = g4fClientsCache[subProvider];

    // Get models from client
    const modelList = await client.models.list();

    // Format models - filter chat/text only
    const models = modelList
      .filter(m => !m.type || ['chat', 'text'].includes(m.type))
      .map(m => ({
        value: m.id,
        label: m.label || m.id,
      }));

    return models;
  } catch (e) {
    console.error('Error fetching gpt4free models:', e);
    return [];
  }
}

/**
 * Settings panel for API configuration - all keys stored separately
 * Models are fetched dynamically from provider APIs
 * Adapts layout for bottom panel (horizontal) vs right panel (vertical)
 */
function SettingsPanel({ onClose, isBottomPanel }) {
  const settings = useSettings();
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicApiKey || '');
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [provider, setProvider] = useState(settings.aiProvider || 'openai');

  // GPT4Free sub-provider state
  const [gpt4freeSubProvider, setGpt4freeSubProviderLocal] = useState(settings.gpt4freeSubProvider || 'default');
  const [gpt4freeProviders, setGpt4freeProviders] = useState([]); // Loaded dynamically
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Dynamic models state - load from cache
  const [models, setModels] = useState(() => loadCachedModels());

  // Initialize model from settings or first available
  const [model, setModel] = useState(() => {
    if (settings.aiModel) return settings.aiModel;
    const cached = loadCachedModels();
    const providerModels = cached?.[settings.aiProvider || 'openai'] || FALLBACK_MODELS[settings.aiProvider || 'openai'];
    return providerModels[0]?.value || '';
  });
  const [loadingModels, setLoadingModels] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
    gpt4free: false,
  });

  // Get current API key for provider
  const getKeyForProvider = useCallback((p) => {
    switch (p) {
      case 'openai': return openaiKey;
      case 'anthropic': return anthropicKey;
      case 'gemini': return geminiKey;
      default: return '';
    }
  }, [openaiKey, anthropicKey, geminiKey]);

  // Fetch models when API key changes (or for gpt4free without key)
  const loadModelsForProvider = useCallback(async (p, key, subProvider = 'default') => {
    // gpt4free doesn't need API key
    if (p !== 'gpt4free' && (!key || key.length < 10)) return;

    setLoadingModels(prev => ({ ...prev, [p]: true }));
    try {
      // For gpt4free, pass sub-provider to fetch models
      const fetchedModels = p === 'gpt4free'
        ? await fetchGpt4freeModels(subProvider)
        : await fetchModels(p, key);

      if (fetchedModels && fetchedModels.length > 0) {
        setModels(prev => {
          const updated = { ...prev, [p]: fetchedModels };
          // Save to localStorage (except gpt4free which is dynamic)
          if (p !== 'gpt4free') {
            saveCachedModels(updated);
          }
          return updated;
        });
        // Set first model as default if current model not in list
        if (p === provider && !fetchedModels.find(m => m.value === model)) {
          setModel(fetchedModels[0].value);
        }
      }
    } catch (e) {
      console.error(`Error loading models for ${p}:`, e);
    } finally {
      setLoadingModels(prev => ({ ...prev, [p]: false }));
    }
  }, [provider, model]);

  // Load gpt4free providers list when selected
  useEffect(() => {
    if (provider === 'gpt4free' && gpt4freeProviders.length === 0) {
      setLoadingProviders(true);
      fetchGpt4freeProviders()
        .then(providers => {
          setGpt4freeProviders(providers);
        })
        .finally(() => setLoadingProviders(false));
    }
  }, [provider, gpt4freeProviders.length]);

  // Load gpt4free models - called directly when sub-provider changes
  const loadGpt4freeModels = useCallback(async (subProvider) => {
    setLoadingModels(prev => ({ ...prev, gpt4free: true }));
    setModels(prev => ({ ...prev, gpt4free: [] })); // Clear models, show "Loading..."

    try {
      const fetchedModels = await fetchGpt4freeModels(subProvider);
      if (fetchedModels && fetchedModels.length > 0) {
        setModels(prev => ({ ...prev, gpt4free: fetchedModels }));
        // Set first model as default
        setModel(fetchedModels[0].value);
      }
    } catch (e) {
      console.error('Error loading gpt4free models:', e);
    } finally {
      setLoadingModels(prev => ({ ...prev, gpt4free: false }));
    }
  }, []);

  // Load gpt4free models on mount if gpt4free is selected
  useEffect(() => {
    if (provider === 'gpt4free' && models.gpt4free.length === 0) {
      loadGpt4freeModels(gpt4freeSubProvider);
    }
  }, []); // Only on mount

  // Track previous key values to detect changes
  const prevKeysRef = useRef({ openai: openaiKey, anthropic: anthropicKey, gemini: geminiKey });

  // Load models when key is first added (changes from empty to non-empty)
  useEffect(() => {
    const prev = prevKeysRef.current;

    // Check if key was just added (was empty, now has value)
    if (!prev.openai && openaiKey && openaiKey.length >= 10) {
      loadModelsForProvider('openai', openaiKey);
    }
    if (!prev.anthropic && anthropicKey && anthropicKey.length >= 10) {
      loadModelsForProvider('anthropic', anthropicKey);
    }
    if (!prev.gemini && geminiKey && geminiKey.length >= 10) {
      loadModelsForProvider('gemini', geminiKey);
    }

    prevKeysRef.current = { openai: openaiKey, anthropic: anthropicKey, gemini: geminiKey };
  }, [openaiKey, anthropicKey, geminiKey, loadModelsForProvider]);

  const handleSave = () => {
    setOpenaiApiKey(openaiKey);
    setAnthropicApiKey(anthropicKey);
    setGeminiApiKey(geminiKey);
    setAiProvider(provider);
    setAiModel(model);
    if (provider === 'gpt4free') {
      setGpt4freeSubProvider(gpt4freeSubProvider);
    }
    onClose?.();
  };

  // Check if current provider has API key (gpt4free doesn't need one)
  const currentProviderHasKey = () => {
    switch (provider) {
      case 'gpt4free': return true; // No API key needed
      case 'openai': return openaiKey.trim().length > 0;
      case 'anthropic': return anthropicKey.trim().length > 0;
      case 'gemini': return geminiKey.trim().length > 0;
      default: return false;
    }
  };

  // Check if current provider is gpt4free (no API key needed)
  const isGpt4free = provider === 'gpt4free';

  // Get current models for selected provider
  const currentModels = models[provider] || FALLBACK_MODELS[provider];
  const isLoadingCurrentModels = loadingModels[provider];

  return (
    <div className="p-3 text-foreground overflow-y-auto overflow-x-hidden space-y-3">
      <h3 className="text-base font-medium">Настройки AI</h3>

      {/* Provider selection */}
      <div className="grid gap-1">
        <label className="text-xs font-medium">Провайдер</label>
        <select
          value={provider}
          onChange={(e) => {
            const newProvider = e.target.value;
            setProvider(newProvider);

            // For gpt4free - load models dynamically
            if (newProvider === 'gpt4free') {
              loadGpt4freeModels(gpt4freeSubProvider);
            } else {
              // For other providers - use cached models
              const newModels = models[newProvider] || FALLBACK_MODELS[newProvider];
              if (newModels.length > 0) {
                setModel(newModels[0].value);
              }
            }
          }}
          className={cx(selectClass, 'text-sm py-1.5')}
        >
          <option value="gpt4free">GPT4Free (бесплатно) ✓</option>
          <option value="openai">OpenAI {openaiKey ? '✓' : ''}</option>
          <option value="anthropic">Anthropic {anthropicKey ? '✓' : ''}</option>
          <option value="gemini">Gemini {geminiKey ? '✓' : ''}</option>
        </select>
      </div>

      {/* GPT4Free sub-provider - показываем сразу после провайдера */}
      {isGpt4free && (
        <div className="space-y-2">
          <div className="p-2 bg-green-500/10 rounded-md border border-green-500/30">
            <p className="text-xs text-green-400">✓ Бесплатный доступ - API ключ не требуется</p>
          </div>

          <div className="grid gap-1">
            <label className="text-xs flex items-center gap-1">
              Провайдер g4f
              {loadingProviders && <span className="opacity-50">загрузка...</span>}
            </label>
            <select
              value={gpt4freeSubProvider}
              onChange={(e) => {
                const newSubProvider = e.target.value;
                setGpt4freeSubProviderLocal(newSubProvider);
                // Load models for new sub-provider immediately (like g4f.dev)
                loadGpt4freeModels(newSubProvider);
              }}
              className={cx(selectClass, 'text-sm py-1.5')}
              disabled={loadingProviders}
            >
              {gpt4freeProviders.length === 0 ? (
                <option value="default">Auto (default)</option>
              ) : (
                gpt4freeProviders.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

      {/* Model selection */}
      <div className="grid gap-1">
        <label className="text-xs flex items-center gap-1">
          Модель
          {isLoadingCurrentModels && <span className="opacity-50">...</span>}
        </label>
        <div className="flex gap-1">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={cx(selectClass, 'flex-1 text-sm py-1.5')}
            disabled={isLoadingCurrentModels || currentModels.length === 0}
          >
            {currentModels.length === 0 ? (
              <option value="">
                {isLoadingCurrentModels ? 'Загрузка моделей...' : 'Нет моделей'}
              </option>
            ) : (
              currentModels.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={() => {
              if (isGpt4free) {
                loadGpt4freeModels(gpt4freeSubProvider);
              } else {
                loadModelsForProvider(provider, getKeyForProvider(provider));
              }
            }}
            disabled={isLoadingCurrentModels || (!isGpt4free && !currentProviderHasKey())}
            className="px-2 text-sm rounded border border-foreground/30 hover:bg-lineBackground disabled:opacity-30"
            title="Обновить модели"
          >
            ↻
          </button>
        </div>
      </div>

      {/* API Keys - скрываем для gpt4free */}
      {!isGpt4free && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium">API Ключи</h4>
          <div className={isBottomPanel ? 'flex gap-2 flex-wrap' : 'space-y-2'}>
            <div className={cx('grid gap-1', isBottomPanel && 'min-w-[120px] flex-1')}>
              <label className="text-xs flex items-center gap-1">
                OpenAI {openaiKey && <span className="text-green-400">✓</span>}
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className={cx(inputClass, 'text-sm py-1')}
              />
            </div>
            <div className={cx('grid gap-1', isBottomPanel && 'min-w-[120px] flex-1')}>
              <label className="text-xs flex items-center gap-1">
                Anthropic {anthropicKey && <span className="text-green-400">✓</span>}
              </label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className={cx(inputClass, 'text-sm py-1')}
              />
            </div>
            <div className={cx('grid gap-1', isBottomPanel && 'min-w-[120px] flex-1')}>
              <label className="text-xs flex items-center gap-1">
                Gemini {geminiKey && <span className="text-green-400">✓</span>}
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className={cx(inputClass, 'text-sm py-1')}
              />
            </div>
          </div>
          <p className="text-xs opacity-50">Ключи хранятся локально</p>
        </div>
      )}

      {/* Save & Links */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={!currentProviderHasKey() || (currentModels.length === 0)}
          className={cx(buttonClass, 'text-sm py-1.5')}
        >
          {isGpt4free ? 'Использовать' : (currentProviderHasKey() ? 'Сохранить' : 'Введите ключ')}
        </button>
        {!isGpt4free && (
          <div className="text-xs opacity-70 flex gap-2">
            <span>Получить:</span>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="underline hover:opacity-50">OpenAI</a>
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="underline hover:opacity-50">Anthropic</a>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="underline hover:opacity-50">Gemini</a>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Message component with markdown support
 * Shows thinking content if available
 */
function Message({ message }) {
  const isUser = message.role === 'user';
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className={cx('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cx(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-selection text-foreground'
            : 'bg-background text-foreground border border-foreground/20',
          message.isThinking && 'opacity-70 italic'
        )}
      >
        {/* Thinking toggle button */}
        {message.thinking && !message.isThinking && (
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="text-xs opacity-50 hover:opacity-100 mb-2 flex items-center gap-1"
          >
            <span>{showThinking ? '▼' : '▶'}</span>
            <span>💭 Мысли модели</span>
          </button>
        )}

        {/* Thinking content (collapsible) */}
        {showThinking && message.thinking && (
          <div className="mb-2 p-2 bg-foreground/5 rounded text-xs opacity-70 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
            {message.thinking}
          </div>
        )}

        {isUser ? (
          <div className="whitespace-pre-wrap break-words">
            {message.content || '...'}
          </div>
        ) : (
          <div className="markdown-content prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                // Code blocks
                code({ node, inline, className, children, ...props }) {
                  return inline ? (
                    <code className="bg-lineHighlight px-1 py-0.5 rounded text-xs" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-lineHighlight p-2 rounded overflow-x-auto my-2">
                      <code className="text-xs" {...props}>{children}</code>
                    </pre>
                  );
                },
                // Links
                a({ href, children }) {
                  return (
                    <a href={href} target="_blank" rel="noopener" className="text-selection underline">
                      {children}
                    </a>
                  );
                },
                // Lists
                ul({ children }) {
                  return <ul className="list-disc list-inside my-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside my-1">{children}</ol>;
                },
                // Paragraphs
                p({ children }) {
                  return <p className="my-1">{children}</p>;
                },
                // Headers
                h1({ children }) {
                  return <h1 className="text-base font-bold my-2">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-sm font-bold my-2">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-sm font-semibold my-1">{children}</h3>;
                },
              }}
            >
              {message.content || '...'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main ChatTab component
 */
export function ChatTab({ context, isBottomPanel }) {
  const messagesEndRef = useRef(null);
  const chat = useChatContext(context);
  const [showSettings, setShowSettings] = useState(false);
  const lastAutoSentErrorRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Автоотправка ошибок выполнения кода в чат
  useEffect(() => {
    if (context?.error && !chat.isLoading && chat.hasApiKey) {
      const errorMsg = context.error.message || String(context.error);
      // Не отправляем одну и ту же ошибку повторно
      if (errorMsg && errorMsg !== lastAutoSentErrorRef.current) {
        lastAutoSentErrorRef.current = errorMsg;
        chat.sendEditorError(errorMsg);
      }
    }
  }, [context?.error, chat.isLoading, chat.hasApiKey, chat.sendEditorError]);

  // Show settings if no API key
  if (!chat.hasApiKey || showSettings) {
    return (
      <div className="h-full w-full flex flex-col text-foreground">
        <div className="flex items-center justify-between p-2 border-b border-foreground/20">
          <div className="flex items-center gap-2">
            <span>🤖</span>
            <span className="text-sm font-medium">Bulka AI</span>
          </div>
          {chat.hasApiKey && (
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs hover:opacity-50"
            >
              ← Назад
            </button>
          )}
        </div>
        <SettingsPanel onClose={() => setShowSettings(false)} isBottomPanel={isBottomPanel} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-foreground/20">
        <div className="flex items-center gap-2">
          <span>🤖</span>
          <span className="text-sm font-medium">Bulka AI</span>
          <span className="text-xs opacity-50">({chat.model})</span>
        </div>
        <div className="flex gap-2">
          {chat.messages.length > 0 && (
            <button
              onClick={chat.clearMessages}
              className="text-xs hover:opacity-50"
            >
              Очистить
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs hover:opacity-50"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-foreground/20">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => chat.sendMessage(s.prompt)}
            disabled={chat.isLoading}
            className="px-2 py-1 text-xs rounded-md bg-background border border-foreground/30 hover:opacity-50 disabled:opacity-30"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-lg font-medium mb-2">Привет!</h3>
            <p className="text-sm opacity-70 max-w-sm">
              Я помогу тебе писать музыку. Опиши что хочешь создать.
            </p>
          </div>
        ) : (
          <>
            {chat.messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
            {chat.isLoading && !chat.messages[chat.messages.length - 1]?.content && (
              <div className="flex justify-start mb-3">
                <div className="bg-background border border-foreground/20 rounded-lg px-3 py-2 text-sm opacity-70">
                  Думаю...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error with "Send to Chat" button */}
      {chat.error && (
        <div className="mx-3 mb-2 p-2 text-xs text-red-400 bg-red-500/10 rounded-md border border-red-500/30">
          <div className="flex items-start justify-between gap-2">
            <span className="flex-1">{chat.error}</span>
            <button
              onClick={() => {
                const errorMsg = `Произошла ошибка: ${chat.error}\n\nПомоги разобраться и исправить.`;
                chat.setError(null);
                chat.sendMessage(errorMsg);
              }}
              className="shrink-0 px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/50"
              title="Отправить ошибку в чат для анализа"
            >
              📤 В чат
            </button>
          </div>
        </div>
      )}

      {/* Action Indicator (автоскрытие через 3 сек) */}
      {chat.lastAction && (
        <div className="mx-3 mb-2 p-2 bg-selection/30 rounded-md border border-selection/50 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-foreground">
            <span>{chat.lastAction}</span>
            <button
              onClick={() => chat.setLastAction(null)}
              className="ml-auto text-foreground/50 hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input - textarea для многострочного ввода */}
      <form onSubmit={chat.handleSubmit} className="flex gap-2 p-2 border-t border-foreground/20">
        <div className="flex-1 relative">
          <textarea
            value={chat.input}
            onChange={chat.handleInputChange}
            onKeyDown={chat.handleKeyDown}
            placeholder="Опиши что хочешь создать... (Ctrl+Shift+Enter для отправки)"
            rows={3}
            className={cx(inputClass, 'resize-none min-h-[72px] max-h-[150px]')}
          />
        </div>
        <div className="flex flex-col gap-1">
          {chat.isLoading ? (
            <button
              type="button"
              onClick={chat.stop}
              className="px-3 py-2 rounded-md bg-background text-red-400 border border-red-500/50 hover:opacity-50 text-sm"
            >
              ⏹
            </button>
          ) : (
            <button
              type="submit"
              disabled={!chat.input.trim()}
              className={cx(buttonClass, 'px-3')}
            >
              ↵
            </button>
          )}
        </div>
      </form>

      {/* Playback status indicator */}
      {chat.isPlaying && (
        <div className="px-3 py-1 text-xs text-green-400 border-t border-foreground/10 flex items-center gap-2">
          <span className="animate-pulse">●</span>
          <span>Музыка играет</span>
        </div>
      )}
    </div>
  );
}

export default ChatTab;
