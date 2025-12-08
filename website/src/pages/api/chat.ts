/**
 * Bulka Music AI Agent - Chat API Endpoint
 *
 * This endpoint handles chat requests and streams responses using Vercel AI SDK.
 * It supports tool calling for interacting with the music editor.
 */

import type { APIRoute } from 'astro';
import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { SYSTEM_PROMPT } from '../../repl/ai-agent/system-prompt';
import { searchKnowledge, formatKnowledgeForContext, KNOWLEDGE_BASE } from '../../repl/ai-agent/knowledge';
import { SOUND_CATEGORIES, DRUM_MACHINES } from '../../repl/ai-agent/tools';

// Disable prerendering for this API route
export const prerender = false;

/**
 * Get the AI model based on environment configuration
 */
function getModel() {
  const provider = import.meta.env.AI_PROVIDER || 'openai';
  const modelName = import.meta.env.AI_MODEL || 'gpt-4o-mini';

  if (provider === 'anthropic') {
    const anthropic = createAnthropic({
      apiKey: import.meta.env.ANTHROPIC_API_KEY,
    });
    return anthropic(modelName);
  }

  // Default to OpenAI
  const openai = createOpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY,
    // Support for alternative OpenAI-compatible APIs
    baseURL: import.meta.env.OPENAI_BASE_URL || undefined,
  });
  return openai(modelName);
}

/**
 * Define tools for the AI agent
 * Note: Actual execution happens on the client side
 * These tools return instructions for the client to execute
 */
const agentTools = {
  // Search documentation
  searchDocs: tool({
    description: 'Поиск по документации Strudel. Используй чтобы найти информацию о функциях, синтаксисе, звуках, эффектах.',
    parameters: z.object({
      query: z.string().describe('Поисковый запрос'),
    }),
    execute: async ({ query }) => {
      const results = searchKnowledge(query, 3);
      if (results.length === 0) {
        return {
          found: false,
          message: 'Ничего не найдено по запросу: ' + query,
        };
      }
      return {
        found: true,
        results: results.map(r => ({
          title: r.title,
          content: r.content,
        })),
        formatted: formatKnowledgeForContext(results),
      };
    },
  }),

  // Get sounds list
  getSoundsList: tool({
    description: 'Получить список доступных звуков и инструментов.',
    parameters: z.object({
      category: z.enum(['drums', 'synths', 'bass', 'effects', 'all']).optional().default('all'),
    }),
    execute: async ({ category }) => {
      if (category === 'all') {
        return SOUND_CATEGORIES;
      }
      return SOUND_CATEGORIES[category as keyof typeof SOUND_CATEGORIES] || {};
    },
  }),

  // Get drum machines list
  getDrumMachines: tool({
    description: 'Получить список доступных драм-машин.',
    parameters: z.object({}),
    execute: async () => {
      return {
        machines: DRUM_MACHINES,
        usage: 's("bd sd hh").bank("RolandTR808")',
      };
    },
  }),

  // Client-side tools - return action instructions
  getCurrentCode: tool({
    description: 'Получить текущий код из редактора.',
    parameters: z.object({}),
    execute: async () => {
      // This will be handled by the client
      return { action: 'getCurrentCode' };
    },
  }),

  setEditorCode: tool({
    description: 'Установить код в редактор (заменяет весь код).',
    parameters: z.object({
      code: z.string().describe('Код для установки'),
    }),
    execute: async ({ code }) => {
      return { action: 'setEditorCode', code };
    },
  }),

  appendCode: tool({
    description: 'Добавить код в конец редактора.',
    parameters: z.object({
      code: z.string().describe('Код для добавления'),
    }),
    execute: async ({ code }) => {
      return { action: 'appendCode', code };
    },
  }),

  playMusic: tool({
    description: 'Запустить воспроизведение музыки.',
    parameters: z.object({}),
    execute: async () => {
      return { action: 'playMusic' };
    },
  }),

  stopMusic: tool({
    description: 'Остановить воспроизведение.',
    parameters: z.object({}),
    execute: async () => {
      return { action: 'stopMusic' };
    },
  }),

  togglePlayback: tool({
    description: 'Переключить воспроизведение.',
    parameters: z.object({}),
    execute: async () => {
      return { action: 'togglePlayback' };
    },
  }),
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages, editorContext } = body;

    // Build context with current editor state if provided
    let contextAddition = '';
    if (editorContext?.currentCode) {
      contextAddition = `\n\n## Текущий код в редакторе:\n\`\`\`\n${editorContext.currentCode}\n\`\`\``;
    }
    if (editorContext?.isPlaying !== undefined) {
      contextAddition += `\n\nСтатус воспроизведения: ${editorContext.isPlaying ? 'играет' : 'остановлено'}`;
    }

    const model = getModel();

    const result = streamText({
      model,
      system: SYSTEM_PROMPT + contextAddition,
      messages,
      tools: agentTools,
      maxSteps: 5, // Allow multi-step tool usage
      temperature: 0.7,
      onStepFinish: ({ text, toolCalls, toolResults }) => {
        // Log for debugging (optional)
        if (toolCalls && toolCalls.length > 0) {
          console.log('[AI Agent] Tool calls:', toolCalls.map(t => t.toolName));
        }
      },
    });

    // Return streaming response
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('[AI Agent] Error:', error);

    // Check for missing API key
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('API key') || errorMessage.includes('apiKey')) {
      return new Response(
        JSON.stringify({
          error: 'API ключ не настроен. Добавьте OPENAI_API_KEY или ANTHROPIC_API_KEY в переменные окружения.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ошибка AI агента: ' + errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
