/**
 * ChatTab - AI Assistant Chat Interface
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import cx from '@src/cx.mjs';
import ReactMarkdown from 'react-markdown';
import { useChatContext } from '../../useChatContext';
import { useSettings, setOpenaiApiKey, setAnthropicApiKey, setGeminiApiKey, setZaiApiKey, setOpenrouterApiKey, setLocalBaseUrl, setLocalApiKey, setLocalModelParams, setAiProvider, setAiModel, setOpenrouterModelParams, getApiKeyForProvider } from '../../../settings.mjs';
import { getRandomSuggestions } from '../../data/suggestions.js';

// Common input styles matching SettingsTab
const inputClass = 'w-full p-2 bg-background rounded-md text-foreground border border-foreground/30 focus:border-foreground focus:outline-none';
const selectClass = 'w-full p-2 bg-background rounded-md text-foreground border border-foreground/30';
const buttonClass = 'px-4 py-2 rounded-md bg-background text-foreground border border-foreground/30 hover:bg-lineBackground disabled:opacity-50';

// Provider display names for the chat header
const PROVIDER_LABELS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  zai: 'Z.AI',
  openrouter: 'OpenRouter',
  free: 'Бесплатно (OVHcloud)',
  mcp: 'Внешний агент (MCP)',
  local: 'Локально',
};

// Empty defaults - all models are fetched dynamically from provider APIs
const EMPTY_MODELS = {
  openai: [],
  anthropic: [],
  gemini: [],
  zai: [],
  openrouter: [],
  free: [],
  local: [],
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
        openai: parsed.openai || [],
        anthropic: parsed.anthropic || [],
        gemini: parsed.gemini || [],
        zai: parsed.zai || [],
        openrouter: parsed.openrouter || [],
        free: [],
        local: [],
      };
    }
  } catch (e) {
    console.error('Error loading cached models:', e);
  }
  return { ...EMPTY_MODELS };
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
  // Бесплатный провайдер (OVHcloud) — список моделей тянем на клиенте, без ключа
  if (provider === 'free') {
    return fetchFreeModels();
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

// Бесплатный AI без ключа/авторизации — OVHcloud AI Endpoints (OpenAI-совместимый).
// Проверено из браузера: отвечает и стримит без ключа/капчи. Другие бесплатные варианты
// отпали (требуют proof-of-work, вход в аккаунт или капчу из браузера).
// Ограничение бесплатного тарифа — 2 запроса в минуту на IP.
const FREE_AI_MODELS_ENDPOINT = 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models';
const FREE_AI_DEFAULT_MODEL = 'gpt-oss-20b';

// Не-чат модели OVHcloud (эмбеддинги, STT, TTS, картинки, модерация) — в чат не предлагаем.
const FREE_AI_NON_CHAT = /embedding|bge-|whisper|nvr-tts|stable-diffusion|guard/i;

// Человекочитаемые ярлыки ключевых моделей.
const FREE_AI_LABELS = {
  'gpt-oss-20b': 'GPT-OSS 20B (быстрая, по умолчанию)',
  'gpt-oss-120b': 'GPT-OSS 120B (умнее, медленнее)',
  'Meta-Llama-3_3-70B-Instruct': 'Llama 3.3 70B',
  'Qwen3-32B': 'Qwen3 32B',
  'Qwen3.6-27B': 'Qwen3.6 27B',
  'Qwen3.5-397B-A17B': 'Qwen3.5 397B (MoE)',
  'Qwen3.5-9B': 'Qwen3.5 9B',
  'Qwen3-Coder-30B-A3B-Instruct': 'Qwen3 Coder 30B',
  'Qwen2.5-VL-72B-Instruct': 'Qwen2.5-VL 72B',
  'Mistral-Small-3.2-24B-Instruct-2506': 'Mistral Small 24B',
  'Mistral-Nemo-Instruct-2407': 'Mistral Nemo 12B',
  'Mistral-7B-Instruct-v0.3': 'Mistral 7B',
};

/**
 * Список бесплатных чат-моделей OVHcloud (без ключа). Живьём с /v1/models,
 * дефолтная модель — первой. При недоступности отдаём разумный фолбэк.
 */
async function fetchFreeModels() {
  const fallback = [
    { value: FREE_AI_DEFAULT_MODEL, label: FREE_AI_LABELS[FREE_AI_DEFAULT_MODEL] },
    { value: 'gpt-oss-120b', label: FREE_AI_LABELS['gpt-oss-120b'] },
  ];
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const resp = await fetch(FREE_AI_MODELS_ENDPOINT, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!resp.ok) return fallback;
    const data = await resp.json();
    const ids = (data.data || [])
      .map((m) => m.id)
      .filter((id) => id && !FREE_AI_NON_CHAT.test(id));
    if (ids.length === 0) return fallback;
    // Дефолтную модель — первой.
    ids.sort((a, b) => (a === FREE_AI_DEFAULT_MODEL ? -1 : b === FREE_AI_DEFAULT_MODEL ? 1 : 0));
    return ids.map((id) => ({ value: id, label: FREE_AI_LABELS[id] || id }));
  } catch (e) {
    console.error('Error fetching free AI models:', e);
    return fallback;
  }
}

// Канонический порядок уровней reasoning (OpenRouter): minimal < low < medium < high < xhigh < max.
const EFFORT_ORDER = ['minimal', 'low', 'medium', 'high', 'xhigh', 'max'];
const sortEfforts = (arr) =>
  [...(arr || [])].filter((e) => typeof e === 'string').sort((a, b) => EFFORT_ORDER.indexOf(a) - EFFORT_ORDER.indexOf(b));

/**
 * Настройки конкретной OpenRouter-модели. Источник истины — метаданные модели из /models:
 *  • supported_parameters — какие параметры показывать;
 *  • reasoning{ supported_efforts, default_effort, mandatory, supports_max_tokens } — реальная схема
 *    рассуждений: допустимые уровни, дефолтный, можно ли выключить, есть ли бюджет токенов;
 *  • default_parameters — реальные дефолты (temp/top_p/top_k) там, где модель их публикует;
 *  • top_provider.max_completion_tokens — реальный лимит ответа.
 * OpenRouter НЕ инжектит дефолты: не послал параметр → провайдер применяет свой (см. доку parameters),
 * поэтому шлём ТОЛЬКО то, что пользователь явно переопределил.
 */
function OpenRouterModelSettings({ modelInfo }) {
  const settings = useSettings();
  const modelId = modelInfo?.value;
  const supported = modelInfo?.supportedParameters || [];
  const defaults = modelInfo?.defaultParameters || {};
  const reasoning = modelInfo?.reasoning || null;
  const maxLimit = modelInfo?.maxCompletionTokens ?? modelInfo?.contextLength;
  const saved = (settings.openrouterModelParams || {})[modelId] || {};

  if (!modelId) return null;

  const supportsTemp = supported.includes('temperature');
  const supportsTopP = supported.includes('top_p');
  const supportsMaxTokens = supported.includes('max_tokens');

  // Реальные уровни reasoning модели. Уровнями управляем, только если модель их публикует.
  const efforts = sortEfforts(reasoning?.supported_efforts);
  const supportsEffort = (supported.includes('reasoning') || supported.includes('reasoning_effort')) && efforts.length > 0;
  const supportsReasoningBudget = !!reasoning?.supports_max_tokens;
  // reasoning есть, но без настраиваемых уровней/бюджета (напр. mandatory без supported_efforts)
  const reasoningFixed = !!reasoning && !supportsEffort && !supportsReasoningBudget;

  if (!(supportsTemp || supportsTopP || supportsMaxTokens || supportsEffort || supportsReasoningBudget || reasoningFixed)) {
    return <div className="text-xs opacity-60 p-2">У этой модели нет настраиваемых параметров.</div>;
  }

  // Значения: сохранённое пользователем → опубликованный дефолт модели → общепринятое.
  const temp = saved.temperature ?? defaults.temperature ?? 1;
  const topP = saved.top_p ?? defaults.top_p ?? 1;
  const reasoningEffort = saved.reasoning_effort ?? '';
  const reasoningBudget = saved.reasoning_max_tokens ?? '';
  const maxTokens = saved.max_tokens ?? '';

  const update = (patch) => setOpenrouterModelParams(modelId, patch);
  const reset = () =>
    setOpenrouterModelParams(modelId, {
      temperature: undefined, top_p: undefined, max_tokens: undefined,
      reasoning_effort: undefined, reasoning_max_tokens: undefined,
    });

  const hasPublishedDefaults = defaults && Object.keys(defaults).some((k) => defaults[k] != null);

  return (
    <div className="grid gap-2 p-2 rounded-md border border-foreground/20">
      <div className="text-xs opacity-70">
        Параметры модели {hasPublishedDefaults ? '(дефолты — с OpenRouter)' : '(пустое = дефолт провайдера)'}
      </div>

      {supportsEffort && (
        <label className="grid gap-1 text-xs">
          Уровень рассуждений (reasoning){reasoning?.mandatory ? ' · нельзя выключить' : ''}
          <select
            className={cx(selectClass, 'text-sm py-1')}
            value={reasoningEffort}
            onChange={(e) => update({ reasoning_effort: e.target.value || undefined })}
          >
            <option value="">
              по умолчанию{reasoning?.default_effort ? ` (${reasoning.default_effort})` : ''}
            </option>
            {efforts.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </label>
      )}

      {supportsReasoningBudget && (
        <label className="grid gap-1 text-xs">
          <span>Бюджет токенов на размышление{maxLimit ? ` (до ${maxLimit})` : ''}</span>
          <input
            type="number"
            min="1"
            max={maxLimit || undefined}
            className={cx(inputClass, 'text-sm py-1')}
            value={reasoningBudget}
            placeholder="по умолчанию"
            onChange={(e) => update({ reasoning_max_tokens: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </label>
      )}

      {reasoningFixed && (
        <div className="text-[11px] opacity-60">
          Рассуждения включены{reasoning?.mandatory ? ' (обязательны, не отключаются)' : ''}; уровень у этой модели не настраивается.
        </div>
      )}

      {supportsTemp && (
        <label className="grid gap-1 text-xs">
          <span>Температура: {Number(temp).toFixed(2)}{saved.temperature == null ? ' (дефолт)' : ''}</span>
          <input type="range" min="0" max="2" step="0.05" value={temp}
            onChange={(e) => update({ temperature: parseFloat(e.target.value) })} />
        </label>
      )}

      {supportsTopP && (
        <label className="grid gap-1 text-xs">
          <span>top_p: {Number(topP).toFixed(2)}{saved.top_p == null ? ' (дефолт)' : ''}</span>
          <input type="range" min="0" max="1" step="0.01" value={topP}
            onChange={(e) => update({ top_p: parseFloat(e.target.value) })} />
        </label>
      )}

      {supportsMaxTokens && (
        <label className="grid gap-1 text-xs">
          <span>Макс. токенов ответа{maxLimit ? ` (лимит ${maxLimit})` : ''}</span>
          <input type="number" min="1" max={maxLimit || undefined}
            className={cx(inputClass, 'text-sm py-1')}
            value={maxTokens} placeholder="по умолчанию"
            onChange={(e) => update({ max_tokens: e.target.value ? parseInt(e.target.value) : undefined })} />
        </label>
      )}

      <button type="button" className="text-xs opacity-60 hover:opacity-100 underline justify-self-start" onClick={reset}>
        Сбросить к дефолтам
      </button>
    </div>
  );
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
  const [zaiKey, setZaiKey] = useState(settings.zaiApiKey || '');
  const [openrouterKey, setOpenrouterKey] = useState(settings.openrouterApiKey || '');
  const [localUrl, setLocalUrl] = useState(settings.localBaseUrl || 'http://localhost:1234/v1');
  const [localKey, setLocalKey] = useState(settings.localApiKey || '');
  const [localParams, setLocalParams] = useState(settings.localModelParams || { temperature: 0.7, max_tokens: 8192 });
  const setLP = (patch) => setLocalParams((p) => ({ ...p, ...patch }));
  const [provider, setProvider] = useState(settings.aiProvider || 'openai');

  // Dynamic models state - load from cache (single parse)
  const initialModels = useMemo(() => loadCachedModels(), []);
  const [models, setModels] = useState(initialModels);

  // Initialize model from settings or first available
  const [model, setModel] = useState(() => {
    if (settings.aiModel) return settings.aiModel;
    const providerModels = initialModels?.[settings.aiProvider || 'openai'] || EMPTY_MODELS[settings.aiProvider || 'openai'];
    return providerModels[0]?.value || '';
  });
  const [loadingModels, setLoadingModels] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
    zai: false,
    openrouter: false,
    free: false,
    local: false,
  });

  // Get current API key for provider
  const getKeyForProvider = useCallback((p) => {
    switch (p) {
      case 'openai': return openaiKey;
      case 'anthropic': return anthropicKey;
      case 'gemini': return geminiKey;
      case 'zai': return zaiKey;
      case 'openrouter': return openrouterKey;
      default: return '';
    }
  }, [openaiKey, anthropicKey, geminiKey, zaiKey, openrouterKey]);

  // Fetch models when API key changes (or for free without key)
  const loadModelsForProvider = useCallback(async (p, key) => {
    // Бесплатный провайдер (free → OVHcloud) не требует ключ
    if (p !== 'free' && (!key || key.length < 10)) return;

    setLoadingModels(prev => ({ ...prev, [p]: true }));
    try {
      const fetchedModels = p === 'free'
        ? await fetchFreeModels()
        : await fetchModels(p, key);

      if (fetchedModels && fetchedModels.length > 0) {
        setModels(prev => {
          const updated = { ...prev, [p]: fetchedModels };
          // Save to localStorage (except free which is dynamic)
          if (p !== 'free') {
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

  // Загрузка бесплатных моделей (OVHcloud) — при выборе провайдера/обновлении
  const loadFreeModels = useCallback(async () => {
    setLoadingModels(prev => ({ ...prev, free: true }));
    setModels(prev => ({ ...prev, free: [] })); // очищаем, показываем «Загрузка…»
    try {
      const fetchedModels = await fetchFreeModels();
      if (fetchedModels && fetchedModels.length > 0) {
        setModels(prev => ({ ...prev, free: fetchedModels }));
        setModel(fetchedModels[0].value);
      }
    } catch (e) {
      console.error('Error loading free AI models:', e);
    } finally {
      setLoadingModels(prev => ({ ...prev, free: false }));
    }
  }, []);

  // Загрузка списка моделей с локального OpenAI-совместимого сервера (LM Studio / Ollama).
  const loadLocalModels = useCallback(async (url, key) => {
    setLoadingModels(prev => ({ ...prev, local: true }));
    setModels(prev => ({ ...prev, local: [] }));
    try {
      const r = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'local', localBaseUrl: url, apiKey: key || undefined }),
      });
      const data = await r.json();
      if (data.models && data.models.length > 0) {
        setModels(prev => ({ ...prev, local: data.models }));
        setModel(data.models[0].value);
      }
    } catch (e) {
      console.error('Error loading local models:', e);
    } finally {
      setLoadingModels(prev => ({ ...prev, local: false }));
    }
  }, []);

  // Load models on mount for current provider
  useEffect(() => {
    if (provider === 'free') {
      if (models.free.length === 0) {
        loadFreeModels();
      }
    } else if (provider === 'local') {
      if (models.local.length === 0) {
        loadLocalModels(localUrl, localKey);
      }
    } else {
      const key = getKeyForProvider(provider);
      if (key && key.length >= 10 && (!models[provider] || models[provider].length === 0)) {
        loadModelsForProvider(provider, key);
      }
    }
  }, []); // Only on mount

  // Track previous key values to detect changes
  const prevKeysRef = useRef({ openai: openaiKey, anthropic: anthropicKey, gemini: geminiKey, zai: zaiKey, openrouter: openrouterKey });

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
    if (!prev.zai && zaiKey && zaiKey.length >= 10) {
      loadModelsForProvider('zai', zaiKey);
    }
    if (!prev.openrouter && openrouterKey && openrouterKey.length >= 10) {
      loadModelsForProvider('openrouter', openrouterKey);
    }

    prevKeysRef.current = { openai: openaiKey, anthropic: anthropicKey, gemini: geminiKey, zai: zaiKey, openrouter: openrouterKey };
  }, [openaiKey, anthropicKey, geminiKey, zaiKey, openrouterKey, loadModelsForProvider]);

  const handleSave = () => {
    setOpenaiApiKey(openaiKey);
    setAnthropicApiKey(anthropicKey);
    setGeminiApiKey(geminiKey);
    setZaiApiKey(zaiKey);
    setOpenrouterApiKey(openrouterKey);
    setLocalBaseUrl(localUrl);
    setLocalApiKey(localKey);
    setLocalModelParams(localParams);
    setAiProvider(provider);
    setAiModel(model);
    onClose?.();
  };

  // Check if current provider has API key (free doesn't need one)
  const currentProviderHasKey = () => {
    switch (provider) {
      case 'free': return true; // No API key needed
      case 'mcp': return true; // внешний агент — ключ не нужен
      case 'local': return true; // локальная модель — ключ опционален, адрес с дефолтом
      case 'openai': return openaiKey.trim().length > 0;
      case 'anthropic': return anthropicKey.trim().length > 0;
      case 'gemini': return geminiKey.trim().length > 0;
      case 'zai': return zaiKey.trim().length > 0;
      case 'openrouter': return openrouterKey.trim().length > 0;
      default: return false;
    }
  };

  // Check if current provider is free (no API key needed)
  const isFree = provider === 'free';
  const isMcp = provider === 'mcp';
  const isLocal = provider === 'local';

  // Get current models for selected provider
  const currentModels = models[provider] || EMPTY_MODELS[provider];
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

            // Always fetch models dynamically when provider changes
            if (newProvider === 'free') {
              loadFreeModels();
            } else if (newProvider === 'local') {
              loadLocalModels(localUrl, localKey);
            } else {
              const key = getKeyForProvider(newProvider);
              if (key && key.length >= 10) {
                loadModelsForProvider(newProvider, key);
              } else {
                // Use cached models if no key yet
                const cachedModels = models[newProvider] || [];
                if (cachedModels.length > 0) {
                  setModel(cachedModels[0].value);
                }
              }
            }
          }}
          className={cx(selectClass, 'text-sm py-1.5')}
        >
          <option value="free">Бесплатно (OVHcloud) ✓</option>
          <option value="local">Локально (LM Studio / Ollama)</option>
          <option value="mcp">Внешний агент (MCP)</option>
          <option value="openai">OpenAI {openaiKey ? '✓' : ''}</option>
          <option value="anthropic">Anthropic {anthropicKey ? '✓' : ''}</option>
          <option value="gemini">Gemini {geminiKey ? '✓' : ''}</option>
          <option value="zai">Z.AI (GLM) {zaiKey ? '✓' : ''}</option>
          <option value="openrouter">OpenRouter {openrouterKey ? '✓' : ''}</option>
        </select>
      </div>

      {/* Локальная модель (LM Studio / Ollama) — адрес сервера + опц. ключ */}
      {isLocal && (
        <div className="grid gap-2 p-2 rounded-md border border-foreground/20">
          <p className="text-xs opacity-70">
            Локальный OpenAI-совместимый сервер. Запусти LM Studio (Local Server) или Ollama и укажи адрес. Запрос
            идёт через приложение (работает в десктоп-версии; ключ обычно не нужен).
          </p>
          <div className="grid gap-1">
            <label className="text-xs">Адрес сервера (base URL)</label>
            <input
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="http://localhost:1234/v1"
              className={cx(inputClass, 'text-sm py-1')}
            />
            <div className="flex gap-2 text-xs opacity-60">
              <button type="button" className="underline" onClick={() => setLocalUrl('http://localhost:1234/v1')}>LM Studio</button>
              <button type="button" className="underline" onClick={() => setLocalUrl('http://localhost:11434/v1')}>Ollama</button>
            </div>
          </div>
          <div className="grid gap-1">
            <label className="text-xs">API-ключ (опционально)</label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="обычно не нужен"
              className={cx(inputClass, 'text-sm py-1')}
            />
          </div>
          <button
            type="button"
            onClick={() => loadLocalModels(localUrl, localKey)}
            className="px-2 py-1 text-sm rounded border border-foreground/30 hover:bg-lineBackground w-fit"
          >
            Загрузить модели
          </button>

          {/* Параметры генерации локальной модели */}
          <div className="grid gap-2 mt-1 pt-2 border-t border-foreground/15">
            <p className="text-xs font-medium opacity-80">Параметры генерации</p>

            <div className="grid gap-1">
              <label className="text-xs flex justify-between">
                <span>Температура</span>
                <span className="opacity-60 tabular-nums">{Number(localParams.temperature ?? 0.7).toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0" max="2" step="0.05"
                value={localParams.temperature ?? 0.7}
                onChange={(e) => setLP({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-foreground"
              />
              <span className="text-[11px] opacity-50">Ниже — точнее и стабильнее, выше — разнообразнее.</span>
            </div>

            <div className="grid gap-1">
              <label className="text-xs flex justify-between">
                <span>Макс. токенов ответа</span>
                <span className="opacity-60 tabular-nums">{localParams.max_tokens ?? 8192}</span>
              </label>
              <input
                type="number"
                min="256" max="131072" step="256"
                value={localParams.max_tokens ?? 8192}
                onChange={(e) => setLP({ max_tokens: Math.max(1, parseInt(e.target.value) || 0) })}
                className={cx(inputClass, 'text-sm py-1')}
              />
              <span className="text-[11px] opacity-50">Ограничивает длину ответа. Для «думающих» моделей — потолок размышлений (меньше = быстрее отвечает, не зацикливается).</span>
            </div>

            <div className="grid gap-1">
              <label className="text-xs flex justify-between">
                <span>top_p</span>
                <span className="opacity-60 tabular-nums">{Number(localParams.top_p ?? 1).toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={localParams.top_p ?? 1}
                onChange={(e) => setLP({ top_p: parseFloat(e.target.value) })}
                className="w-full accent-foreground"
              />
            </div>

            {/* Размышления (reasoning). LM Studio передаёт reasoning_effort только для моделей,
                которые это умеют (напр. gpt-oss); у остальных управляется шаблоном модели.
                Отдельного «бюджета токенов на размышление» у LM Studio нет — reasoning считается
                в общий «Макс. токенов ответа» выше. */}
            <div className="grid gap-1">
              <label className="text-xs">Уровень размышлений (reasoning_effort)</label>
              <select
                value={localParams.reasoning_effort ?? ''}
                onChange={(e) => setLP({ reasoning_effort: e.target.value })}
                className={cx(selectClass, 'text-sm py-1')}
              >
                <option value="">По умолчанию (как решит модель)</option>
                <option value="low">Низкий — быстрее, короче думает</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий — думает дольше и тщательнее</option>
              </select>
              <span className="text-[11px] opacity-50">Работает у моделей с поддержкой effort (gpt-oss и т.п.); иначе игнорируется. Общую длину размышлений ограничивает «Макс. токенов ответа».</span>
            </div>

            <button
              type="button"
              onClick={() => setLocalParams({ temperature: 0.7, max_tokens: 8192, top_p: 1, reasoning_effort: '' })}
              className="text-[11px] underline opacity-60 hover:opacity-100 w-fit"
            >
              Сбросить к дефолтам
            </button>
          </div>
        </div>
      )}

      {/* Бесплатный провайдер (OVHcloud) — инфо-подсказка */}
      {isFree && (
        <div className="p-2 bg-yellow-500/10 rounded-md border border-yellow-500/30 space-y-1">
          <p className="text-xs text-yellow-400">✓ Бесплатно, без ключа и регистрации — работает прямо из браузера (OVHcloud AI).</p>
          <p className="text-xs text-yellow-400/80">Лимит бесплатного тарифа — 2 запроса в минуту. Если упрётесь, подождите ~30 секунд или укажите свой ключ / OpenRouter. Инструменты (автозапуск, правка кода) могут поддерживаться не всеми моделями.</p>
        </div>
      )}

      {/* Внешний агент (MCP) — инфо-подсказка */}
      {isMcp && (
        <div className="p-2 bg-blue-500/10 rounded-md border border-blue-500/30 space-y-1">
          <p className="text-xs text-blue-300">
            🔌 Сообщения из этого чата уходят внешнему агенту (Claude Desktop / ChatGPT / Cursor), подключённому к
            MCP-серверу Bulka. Он читает их и отвечает прямо сюда, а также сам пишет код и запускает музыку.
          </p>
          <p className="text-xs text-blue-300/70">
            Только в десктоп-версии. Подключение агента — в «Настройках» (панель MCP). Ключ и модель тут не нужны.
          </p>
        </div>
      )}

      {/* Model selection (не нужен для MCP) */}
      {!isMcp && (
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
              if (isFree) {
                loadFreeModels();
              } else if (isLocal) {
                loadLocalModels(localUrl, localKey);
              } else {
                loadModelsForProvider(provider, getKeyForProvider(provider));
              }
            }}
            disabled={isLoadingCurrentModels || (!isFree && !currentProviderHasKey())}
            className="px-2 text-sm rounded border border-foreground/30 hover:bg-lineBackground disabled:opacity-30"
            title="Обновить модели"
          >
            ↻
          </button>
        </div>
      </div>
      )}

      {/* Настройки конкретной модели OpenRouter (reasoning/temperature/top_p/max_tokens) */}
      {provider === 'openrouter' && model && (
        <OpenRouterModelSettings modelInfo={currentModels.find((m) => m.value === model)} />
      )}

      {/* API Keys - скрываем для free, mcp и local (у local свой ввод адреса/ключа) */}
      {!isFree && !isMcp && !isLocal && (
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
            <div className={cx('grid gap-1', isBottomPanel && 'min-w-[120px] flex-1')}>
              <label className="text-xs flex items-center gap-1">
                Z.AI {zaiKey && <span className="text-green-400">✓</span>}
              </label>
              <input
                type="password"
                value={zaiKey}
                onChange={(e) => setZaiKey(e.target.value)}
                placeholder="z.ai ключ..."
                className={cx(inputClass, 'text-sm py-1')}
              />
            </div>
            <div className={cx('grid gap-1', isBottomPanel && 'min-w-[120px] flex-1')}>
              <label className="text-xs flex items-center gap-1">
                OpenRouter {openrouterKey && <span className="text-green-400">✓</span>}
              </label>
              <input
                type="password"
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="sk-or-..."
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
          disabled={!currentProviderHasKey() || (!isFree && !isMcp && currentModels.length === 0)}
          className={cx(buttonClass, 'text-sm py-1.5')}
        >
          {isFree || isMcp || isLocal ? 'Использовать' : (currentProviderHasKey() ? 'Сохранить' : 'Введите ключ')}
        </button>
        {!isFree && !isMcp && !isLocal && (
          <div className="text-xs opacity-70 flex gap-2">
            <span>Получить:</span>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="underline hover:opacity-50">OpenAI</a>
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="underline hover:opacity-50">Anthropic</a>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="underline hover:opacity-50">Gemini</a>
            <a href="https://z.ai/manage-apikey/apikey-list" target="_blank" rel="noopener" className="underline hover:opacity-50">Z.AI</a>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="underline hover:opacity-50">OpenRouter</a>
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
          'max-w-[85%] rounded-lg px-3 py-2 text-sm break-words overflow-hidden [overflow-wrap:anywhere]',
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
          <div className="markdown-content prose prose-sm prose-invert max-w-none break-words [overflow-wrap:anywhere]">
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

  // Random suggestions - regenerate when messages are cleared
  const [suggestionsKey, setSuggestionsKey] = useState(0);
  const suggestions = useMemo(() => getRandomSuggestions(5), [suggestionsKey]);

  // Unified pending message state (for both errors and suggestions)
  // type: 'error' | 'suggestion'
  const [pendingMessage, setPendingMessage] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Start pending message with 5 sec timer
  const startPendingMessage = useCallback((type, text, onSend) => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setPendingMessage({ type, text, onSend });
    setCountdown(5);

    // Countdown interval
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-send timer
    timerRef.current = setTimeout(() => {
      onSend();
      setPendingMessage(null);
      setCountdown(0);
    }, 5000);
  }, []);

  // Cancel pending message
  const cancelPendingMessage = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setPendingMessage(null);
    setCountdown(0);
  }, []);

  // Send pending message immediately
  const sendPendingMessageNow = useCallback(() => {
    if (pendingMessage) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      pendingMessage.onSend();
      setPendingMessage(null);
      setCountdown(0);
    }
  }, [pendingMessage]);

  // Автоотправка ошибок с таймером 5 сек
  useEffect(() => {
    if (context?.error && !chat.isLoading && chat.hasApiKey && !pendingMessage) {
      const errorMsg = context.error.message || String(context.error);
      // Не показываем одну и ту же ошибку повторно
      if (errorMsg && errorMsg !== lastAutoSentErrorRef.current) {
        lastAutoSentErrorRef.current = errorMsg;
        startPendingMessage('error', errorMsg, () => chat.sendEditorError(errorMsg));
      }
    }
  }, [context?.error, chat.isLoading, chat.hasApiKey, pendingMessage, startPendingMessage, chat.sendEditorError]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Start pending suggestion
  const startPendingSuggestion = useCallback((suggestion) => {
    startPendingMessage('suggestion', suggestion.prompt, () => chat.sendMessage(suggestion.prompt));
  }, [startPendingMessage, chat.sendMessage]);

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
          <span className="text-sm font-medium">Bulka AI {PROVIDER_LABELS[chat.provider] || chat.provider}</span>
          {chat.model && <span className="text-xs opacity-50">({chat.model})</span>}
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

      {/* Suggestions - random set, refreshable */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-foreground/20">
        <span className="text-xs opacity-50 mr-1">Идеи:</span>
        {suggestions.map((s, i) => (
          <button
            key={`${suggestionsKey}-${i}`}
            onClick={() => startPendingSuggestion(s)}
            disabled={chat.isLoading || pendingMessage}
            className="px-2 py-1 text-xs rounded-md bg-background border border-foreground/30 hover:opacity-50 disabled:opacity-30"
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => setSuggestionsKey(k => k + 1)}
          disabled={pendingMessage}
          className="px-2 py-1 text-xs rounded-md bg-background border border-foreground/30 hover:opacity-50 opacity-50 disabled:opacity-30"
          title="Показать другие варианты"
        >
          ↻
        </button>
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

      {/* Pending Message with countdown timer (unified for errors and suggestions) */}
      {pendingMessage && (
        <div className={cx(
          'mx-3 mb-2 p-2 text-xs rounded-md border',
          pendingMessage.type === 'error'
            ? 'bg-orange-500/10 border-orange-500/30'
            : 'bg-blue-500/10 border-blue-500/30'
        )}>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className={pendingMessage.type === 'error' ? 'text-orange-400' : 'text-blue-400'}>
                {pendingMessage.type === 'error' ? '⚠️' : '💡'}
              </span>
              <span className={cx('flex-1 break-words', pendingMessage.type === 'error' ? 'text-orange-300' : 'text-blue-300')}>
                {pendingMessage.text}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className={pendingMessage.type === 'error' ? 'text-orange-400/70' : 'text-blue-400/70'}>
                Отправка через {countdown}с...
              </span>
              <div className="flex gap-1">
                <button
                  onClick={cancelPendingMessage}
                  className={cx(
                    'px-2 py-1 text-xs rounded border',
                    pendingMessage.type === 'error'
                      ? 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50 text-orange-300'
                      : 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50 text-blue-300'
                  )}
                >
                  ✕ Отмена
                </button>
                <button
                  onClick={sendPendingMessageNow}
                  className={cx(
                    'px-2 py-1 text-xs rounded border',
                    pendingMessage.type === 'error'
                      ? 'bg-orange-500/30 hover:bg-orange-500/40 border-orange-500/50 text-orange-200'
                      : 'bg-blue-500/30 hover:bg-blue-500/40 border-blue-500/50 text-blue-200'
                  )}
                >
                  📤 Сейчас
                </button>
              </div>
            </div>
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
