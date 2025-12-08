/**
 * ChatTab - AI Assistant Chat Interface
 *
 * Provides a chat interface for interacting with the Bulka Music AI Agent.
 * Features:
 * - Message history display
 * - Streaming responses
 * - Tool call visualization
 * - Quick suggestions
 */

import { useRef, useEffect, useState } from 'react';
import cx from '@src/cx.mjs';
import { useChatContext } from '../../useChatContext';

/**
 * Quick suggestion buttons for common actions
 */
const SUGGESTIONS = [
  { label: 'Простой бит', prompt: 'Создай простой бит с бочкой, снейром и хэтом' },
  { label: 'Добавь бас', prompt: 'Добавь басовую линию к текущему треку' },
  { label: 'Измени темп', prompt: 'Сделай трек быстрее в 2 раза' },
  { label: 'Добавь эффект', prompt: 'Добавь реверберацию и задержку' },
  { label: 'Объясни код', prompt: 'Объясни что делает текущий код' },
  { label: 'Исправь ошибку', prompt: 'Проверь код на ошибки и исправь их' },
];

/**
 * Message component
 */
function Message({ message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cx(
        'flex w-full mb-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cx(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-foreground text-background'
            : 'bg-lineHighlight text-foreground'
        )}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words">
          {message.content || (isAssistant && message.toolCalls?.length > 0 ? '' : '...')}
        </div>

        {/* Tool calls visualization */}
        {isAssistant && message.toolCalls?.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((tool, idx) => (
              <ToolCallBadge key={idx} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tool call badge component
 */
function ToolCallBadge({ tool }) {
  const [expanded, setExpanded] = useState(false);

  // Map tool names to friendly labels
  const toolLabels = {
    getCurrentCode: 'Читаю код',
    setEditorCode: 'Пишу код',
    appendCode: 'Добавляю код',
    playMusic: 'Запускаю',
    stopMusic: 'Останавливаю',
    togglePlayback: 'Переключаю',
    searchDocs: 'Ищу в документации',
    getSoundsList: 'Список звуков',
    getDrumMachines: 'Драм-машины',
  };

  const label = toolLabels[tool.toolName] || tool.toolName;

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/30 text-xs cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <span className="opacity-70">🔧</span>
      <span>{label}</span>
      {expanded && tool.args && (
        <div className="absolute mt-8 left-0 p-2 bg-background border border-lineHighlight rounded text-xs max-w-xs overflow-auto">
          <pre>{JSON.stringify(tool.args, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/**
 * Suggestions bar component
 */
function SuggestionsBar({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-lineHighlight">
      {SUGGESTIONS.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion.prompt)}
          disabled={disabled}
          className={cx(
            'px-2 py-1 text-xs rounded border border-lineHighlight',
            'hover:bg-lineHighlight transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Chat input component
 */
function ChatInput({ value, onChange, onSubmit, onKeyDown, isLoading, onStop }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form onSubmit={onSubmit} className="flex gap-2 p-2 border-t border-lineHighlight">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Опиши что хочешь сделать..."
        disabled={isLoading}
        className={cx(
          'flex-1 px-3 py-2 rounded',
          'bg-background border border-lineHighlight',
          'text-foreground placeholder-foreground/50',
          'focus:outline-none focus:border-foreground/50',
          'disabled:opacity-50'
        )}
      />
      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          className={cx(
            'px-4 py-2 rounded',
            'bg-red-500/20 text-red-400 border border-red-500/50',
            'hover:bg-red-500/30 transition-colors'
          )}
        >
          Стоп
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim()}
          className={cx(
            'px-4 py-2 rounded',
            'bg-foreground text-background',
            'hover:opacity-90 transition-opacity',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          ↵
        </button>
      )}
    </form>
  );
}

/**
 * Loading indicator
 */
function LoadingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-lineHighlight rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Думаю...</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Welcome message when chat is empty
 */
function WelcomeMessage({ onSuggestionClick }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="text-4xl mb-4">🎵</div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Привет! Я Bulka AI
      </h3>
      <p className="text-sm text-foreground/70 mb-4 max-w-sm">
        Я помогу тебе писать музыку. Опиши что хочешь создать, и я напишу код.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.slice(0, 3).map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(s.prompt)}
            className={cx(
              'px-3 py-1.5 text-sm rounded border border-lineHighlight',
              'hover:bg-lineHighlight transition-colors'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Error message component
 */
function ErrorMessage({ error, onRetry }) {
  return (
    <div className="flex justify-center mb-3">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="underline hover:no-underline ml-2"
            >
              Повторить
            </button>
          )}
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Handle suggestion click
  const handleSuggestionClick = (prompt) => {
    chat.sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-lineHighlight">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-medium">Bulka AI</span>
        </div>
        {chat.messages.length > 0 && (
          <button
            onClick={chat.clearMessages}
            className="text-xs text-foreground/50 hover:text-foreground transition-colors"
          >
            Очистить
          </button>
        )}
      </div>

      {/* Suggestions */}
      <SuggestionsBar onSelect={handleSuggestionClick} disabled={chat.isLoading} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3">
        {chat.messages.length === 0 ? (
          <WelcomeMessage onSuggestionClick={handleSuggestionClick} />
        ) : (
          <>
            {chat.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {chat.isLoading && !chat.messages[chat.messages.length - 1]?.content && (
              <LoadingIndicator />
            )}
            {chat.error && <ErrorMessage error={chat.error} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput
        value={chat.input}
        onChange={chat.handleInputChange}
        onSubmit={chat.handleSubmit}
        onKeyDown={chat.handleKeyDown}
        isLoading={chat.isLoading}
        onStop={chat.stop}
      />
    </div>
  );
}

export default ChatTab;
