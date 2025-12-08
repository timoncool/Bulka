/**
 * ChatTab - AI Assistant Chat Interface
 */

import { useRef, useEffect, useState } from 'react';
import cx from '@src/cx.mjs';
import { useChatContext } from '../../useChatContext';
import { useSettings, setAiApiKey, setAiProvider, setAiModel, aiProviders } from '../../../settings.mjs';

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

const MODELS = {
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (быстрый)' },
    { value: 'gpt-4o', label: 'GPT-4o (умный)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (быстрый)' },
  ],
};

/**
 * Settings panel for API configuration
 */
function SettingsPanel({ onClose }) {
  const settings = useSettings();
  const [apiKey, setApiKey] = useState(settings.aiApiKey || '');
  const [provider, setProvider] = useState(settings.aiProvider || 'openai');
  const [model, setModel] = useState(settings.aiModel || 'gpt-4o-mini');

  const handleSave = () => {
    setAiApiKey(apiKey);
    setAiProvider(provider);
    setAiModel(model);
    onClose?.();
  };

  return (
    <div className="p-4 space-y-4 text-foreground">
      <h3 className="text-lg font-medium">Настройки AI</h3>

      {/* Provider */}
      <div className="grid gap-2">
        <label className="text-sm">Провайдер</label>
        <select
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            setModel(MODELS[e.target.value][0].value);
          }}
          className={selectClass}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic (Claude)</option>
        </select>
      </div>

      {/* Model */}
      <div className="grid gap-2">
        <label className="text-sm">Модель</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className={selectClass}
        >
          {MODELS[provider]?.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div className="grid gap-2">
        <label className="text-sm">
          API Ключ {provider === 'openai' ? '(OpenAI)' : '(Anthropic)'}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
          className={inputClass}
        />
        <p className="text-xs opacity-50">
          Ключ хранится только в вашем браузере
        </p>
      </div>

      {/* Links */}
      <div className="text-xs opacity-70">
        Получить ключ:
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener"
          className="ml-2 underline hover:opacity-50"
        >
          OpenAI
        </a>
        <span className="mx-1">|</span>
        <a
          href="https://console.anthropic.com/"
          target="_blank"
          rel="noopener"
          className="underline hover:opacity-50"
        >
          Anthropic
        </a>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!apiKey.trim()}
        className={cx(buttonClass, 'w-full')}
      >
        Сохранить
      </button>
    </div>
  );
}

/**
 * Message component
 */
function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cx('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cx(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-selection text-foreground'
            : 'bg-background text-foreground border border-foreground/20'
        )}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content || '...'}
        </div>
      </div>
    </div>
  );
}

/**
 * Main ChatTab component
 */
export function ChatTab({ context }) {
  const messagesEndRef = useRef(null);
  const chat = useChatContext(context);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Show settings if no API key
  if (!chat.hasApiKey || showSettings) {
    return (
      <div className="h-full flex flex-col text-foreground">
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
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-foreground">
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

      {/* Error */}
      {chat.error && (
        <div className="mx-3 mb-2 p-2 text-xs text-red-400 bg-red-500/10 rounded-md border border-red-500/30">
          {chat.error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={chat.handleSubmit} className="flex gap-2 p-2 border-t border-foreground/20">
        <input
          type="text"
          value={chat.input}
          onChange={chat.handleInputChange}
          onKeyDown={chat.handleKeyDown}
          placeholder="Опиши что хочешь..."
          disabled={chat.isLoading}
          className={cx(inputClass, 'flex-1')}
        />
        {chat.isLoading ? (
          <button
            type="button"
            onClick={chat.stop}
            className="px-4 py-2 rounded-md bg-background text-red-400 border border-red-500/50 hover:opacity-50"
          >
            Стоп
          </button>
        ) : (
          <button
            type="submit"
            disabled={!chat.input.trim()}
            className={buttonClass}
          >
            ↵
          </button>
        )}
      </form>
    </div>
  );
}

export default ChatTab;
