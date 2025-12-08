/**
 * useChatContext - Hook for managing AI chat state
 *
 * Uses server-side RAG for documentation search.
 * API key stored in localStorage and sent with each request.
 */

import { useState, useCallback, useRef } from 'react';
import { useSettings } from '../settings.mjs';

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
 * Main chat hook
 */
export function useChatContext(replContext) {
  const settings = useSettings();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingCode, setPendingCode] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Apply code to editor
   */
  const applyCode = useCallback((code) => {
    if (replContext?.editorRef?.current) {
      replContext.editorRef.current.setCode(code);
      setPendingCode(null);
    }
  }, [replContext]);

  /**
   * Apply code and run it
   */
  const applyAndRun = useCallback((code) => {
    if (replContext?.editorRef?.current) {
      replContext.editorRef.current.setCode(code);
      replContext.editorRef.current.evaluate();
      setPendingCode(null);
    }
  }, [replContext]);

  /**
   * Dismiss pending code without applying
   */
  const dismissPendingCode = useCallback(() => {
    setPendingCode(null);
  }, []);

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

    const { aiApiKey, aiProvider, aiModel } = settings;

    if (!aiApiKey) {
      setError('API ключ не установлен. Откройте настройки и добавьте ключ.');
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
      const currentCode = replContext?.editorRef?.current?.code || '';

      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          apiKey: aiApiKey,
          provider: aiProvider,
          model: aiModel,
          currentCode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      // Parse streaming response from agent
      const reader = response.body.getReader();
      let fullContent = '';
      let actionsExecuted = [];

      for await (const message of parseAgentStream(reader)) {
        // Handle tool calls from agent
        if (message.type === 'tool_call') {
          const { name, args } = message;
          const editor = replContext?.editorRef?.current;

          if (!editor) continue;

          // setFullCode - полная замена кода
          if (name === 'setFullCode' && args?.code) {
            editor.setCode(args.code);
            setPendingCode(args.code);
            actionsExecuted.push('Код установлен');
          }
          // editCode - найти и заменить фрагмент
          else if (name === 'editCode' && args?.search && args?.replace !== undefined) {
            const currentCode = editor.code || '';
            if (currentCode.includes(args.search)) {
              const newCode = currentCode.replace(args.search, args.replace);
              editor.setCode(newCode);
              setPendingCode(newCode);
              actionsExecuted.push('Код отредактирован');
            } else {
              actionsExecuted.push('Фрагмент не найден');
            }
          }
          // appendCode - добавить в конец
          else if (name === 'appendCode' && args?.code) {
            const currentCode = editor.code || '';
            const newCode = currentCode + '\n' + args.code;
            editor.setCode(newCode);
            setPendingCode(newCode);
            actionsExecuted.push('Код добавлен');
          }
          // playMusic - запустить
          else if (name === 'playMusic') {
            editor.evaluate();
            actionsExecuted.push('Воспроизведение запущено');
          }
          // stopMusic - остановить
          else if (name === 'stopMusic') {
            editor.stop();
            actionsExecuted.push('Воспроизведение остановлено');
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
        // Handle errors
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
  }, []);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

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
    // Settings for UI
    hasApiKey: !!settings.aiApiKey,
    provider: settings.aiProvider,
    model: settings.aiModel,
    // Agent capabilities - code editing
    pendingCode,
    applyCode,
    applyAndRun,
    dismissPendingCode,
    getCurrentCode,
    // Agent capabilities - playback control
    play,
    stopPlayback,
    togglePlayback,
    isPlaying,
  };
}

export default useChatContext;
