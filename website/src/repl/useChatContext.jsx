/**
 * useChatContext - Hook for managing AI chat state and interactions
 *
 * This hook provides:
 * - Message history management
 * - Streaming response handling
 * - Tool execution bridge to the editor
 * - Integration with useReplContext for editor control
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Message types
const ROLE_USER = 'user';
const ROLE_ASSISTANT = 'assistant';
const ROLE_TOOL = 'tool';

/**
 * Generate unique message ID
 */
function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse streaming response data
 */
function parseStreamData(line) {
  if (!line.startsWith('0:') && !line.startsWith('2:') && !line.startsWith('9:')) {
    return null;
  }

  try {
    // Remove prefix and parse JSON
    const prefix = line.substring(0, 2);
    const data = line.substring(2);

    if (prefix === '0:') {
      // Text chunk
      return { type: 'text', content: JSON.parse(data) };
    } else if (prefix === '2:') {
      // Tool call
      return { type: 'tool_call', data: JSON.parse(data) };
    } else if (prefix === '9:') {
      // Tool result
      return { type: 'tool_result', data: JSON.parse(data) };
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

/**
 * Main chat hook
 */
export function useChatContext(replContext) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Execute tool actions from AI response
   */
  const executeToolAction = useCallback((action) => {
    if (!replContext?.editorRef?.current) {
      console.warn('[Chat] Editor not available for tool action:', action);
      return { success: false, error: 'Editor not available' };
    }

    const editor = replContext.editorRef.current;

    try {
      switch (action.action) {
        case 'getCurrentCode':
          return {
            success: true,
            result: editor.code || '',
          };

        case 'setEditorCode':
          editor.setCode(action.code);
          return {
            success: true,
            result: 'Code set successfully',
          };

        case 'appendCode':
          editor.appendCode(action.code);
          return {
            success: true,
            result: 'Code appended successfully',
          };

        case 'playMusic':
          editor.evaluate();
          return {
            success: true,
            result: 'Music started',
          };

        case 'stopMusic':
          editor.stop();
          return {
            success: true,
            result: 'Music stopped',
          };

        case 'togglePlayback':
          editor.toggle();
          return {
            success: true,
            result: 'Playback toggled',
          };

        default:
          return {
            success: false,
            error: `Unknown action: ${action.action}`,
          };
      }
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }, [replContext]);

  /**
   * Send message to AI agent
   */
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage = {
      id: generateId(),
      role: ROLE_USER,
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Create assistant message placeholder
    const assistantMessage = {
      id: generateId(),
      role: ROLE_ASSISTANT,
      content: '',
      timestamp: Date.now(),
      toolCalls: [],
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Prepare context
      const editorContext = {
        currentCode: replContext?.editorRef?.current?.code || '',
        isPlaying: replContext?.started || false,
      };

      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Make streaming request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          editorContext,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const parsed = parseStreamData(line);
          if (!parsed) continue;

          if (parsed.type === 'text') {
            fullContent += parsed.content;
            setMessages(prev => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (updated[lastIdx]?.role === ROLE_ASSISTANT) {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: fullContent,
                };
              }
              return updated;
            });
          } else if (parsed.type === 'tool_call') {
            // Process tool calls
            const toolCalls = parsed.data;
            if (Array.isArray(toolCalls)) {
              for (const toolCall of toolCalls) {
                // Execute client-side actions
                if (toolCall.result?.action) {
                  const result = executeToolAction(toolCall.result);
                  console.log('[Chat] Tool executed:', toolCall.toolName, result);
                }
              }

              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === ROLE_ASSISTANT) {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    toolCalls: [...(updated[lastIdx].toolCalls || []), ...toolCalls],
                  };
                }
                return updated;
              });
            }
          }
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Chat] Request aborted');
      } else {
        console.error('[Chat] Error:', err);
        setError(err.message);
        // Remove empty assistant message on error
        setMessages(prev => prev.filter(m => m.content || m.toolCalls?.length > 0));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, replContext, executeToolAction]);

  /**
   * Stop current request
   */
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Clear chat history
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  /**
   * Handle key press (Enter to send)
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [input, sendMessage]);

  return {
    // State
    messages,
    input,
    isLoading,
    error,

    // Actions
    sendMessage,
    stop,
    clearMessages,
    setInput,

    // Event handlers
    handleInputChange,
    handleSubmit,
    handleKeyDown,
  };
}

export default useChatContext;
