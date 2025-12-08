/**
 * ChatTab - AI Assistant Chat Interface
 */

import { useRef, useEffect, useState } from 'react';
import cx from '@src/cx.mjs';
import ReactMarkdown from 'react-markdown';
import { useChatContext } from '../../useChatContext';
import { useSettings, setOpenaiApiKey, setAnthropicApiKey, setGeminiApiKey, setAiProvider, setAiModel, getApiKeyForProvider } from '../../../settings.mjs';

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
    { value: 'gpt-4.1', label: 'GPT-4.1 (топ)' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini (быстрый)' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano (дешёвый)' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'o3', label: 'o3 (рассуждения)' },
    { value: 'o4-mini', label: 'o4-mini (рассуждения быстрый)' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-5-20250514', label: 'Claude Sonnet 4.5 (топ)' },
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-haiku-3-5-20241022', label: 'Claude 3.5 Haiku (быстрый)' },
  ],
  gemini: [
    { value: 'gemini-2.5-pro-preview-06-05', label: 'Gemini 2.5 Pro (топ)' },
    { value: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash (быстрый)' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  ],
};

/**
 * Settings panel for API configuration - all keys stored separately
 */
function SettingsPanel({ onClose }) {
  const settings = useSettings();
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicApiKey || '');
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [provider, setProvider] = useState(settings.aiProvider || 'openai');
  const [model, setModel] = useState(settings.aiModel || 'gpt-4.1');

  const handleSave = () => {
    setOpenaiApiKey(openaiKey);
    setAnthropicApiKey(anthropicKey);
    setGeminiApiKey(geminiKey);
    setAiProvider(provider);
    setAiModel(model);
    onClose?.();
  };

  // Check if current provider has API key
  const currentProviderHasKey = () => {
    switch (provider) {
      case 'openai': return openaiKey.trim().length > 0;
      case 'anthropic': return anthropicKey.trim().length > 0;
      case 'gemini': return geminiKey.trim().length > 0;
      default: return false;
    }
  };

  return (
    <div className="p-4 space-y-4 text-foreground overflow-y-auto max-h-[70vh]">
      <h3 className="text-lg font-medium">Настройки AI</h3>

      {/* Provider */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Активный провайдер</label>
        <select
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            setModel(MODELS[e.target.value][0].value);
          }}
          className={selectClass}
        >
          <option value="openai">OpenAI {openaiKey ? '✓' : ''}</option>
          <option value="anthropic">Anthropic (Claude) {anthropicKey ? '✓' : ''}</option>
          <option value="gemini">Google Gemini {geminiKey ? '✓' : ''}</option>
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

      <hr className="border-foreground/20" />

      {/* All API Keys */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">API Ключи (сохраняются все)</h4>

        {/* OpenAI Key */}
        <div className="grid gap-1">
          <label className="text-xs flex items-center gap-2">
            OpenAI {openaiKey && <span className="text-green-400">✓</span>}
          </label>
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className={cx(inputClass, 'text-sm py-1.5')}
          />
        </div>

        {/* Anthropic Key */}
        <div className="grid gap-1">
          <label className="text-xs flex items-center gap-2">
            Anthropic {anthropicKey && <span className="text-green-400">✓</span>}
          </label>
          <input
            type="password"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
            className={cx(inputClass, 'text-sm py-1.5')}
          />
        </div>

        {/* Gemini Key */}
        <div className="grid gap-1">
          <label className="text-xs flex items-center gap-2">
            Gemini {geminiKey && <span className="text-green-400">✓</span>}
          </label>
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIza..."
            className={cx(inputClass, 'text-sm py-1.5')}
          />
        </div>

        <p className="text-xs opacity-50">
          Все ключи хранятся локально в браузере
        </p>
      </div>

      {/* Links */}
      <div className="text-xs opacity-70 flex flex-wrap gap-2">
        <span>Получить:</span>
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="underline hover:opacity-50">OpenAI</a>
        <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="underline hover:opacity-50">Anthropic</a>
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="underline hover:opacity-50">Gemini</a>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!currentProviderHasKey()}
        className={cx(buttonClass, 'w-full')}
      >
        {currentProviderHasKey() ? 'Сохранить' : `Введите ключ для ${provider}`}
      </button>
    </div>
  );
}

/**
 * Message component with markdown support
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
