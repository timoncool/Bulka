/**
 * Bulka Music AI Agent - Chat API Endpoint
 *
 * FULL AGENT with tool calling support.
 * Tools: setEditorCode, playMusic, stopMusic, searchDocs, etc.
 */

import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export const prerender = false;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_PATH = path.resolve(__dirname, '../../../../docs_md');

/**
 * Tool definitions for the agent
 * Artifact-style editing: read, edit specific parts, append
 */
const TOOLS_OPENAI = [
  {
    type: 'function' as const,
    function: {
      name: 'readCode',
      description: 'Прочитать текущий код из редактора. ВСЕГДА вызывай это первым чтобы увидеть что уже написано.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'editCode',
      description: 'Редактировать код: найти и заменить конкретный фрагмент. Используй для изменения существующего кода без полной перезаписи.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Текст для поиска в текущем коде (точное совпадение)' },
          replace: { type: 'string', description: 'Текст для замены' },
        },
        required: ['search', 'replace'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'appendCode',
      description: 'Добавить код в конец редактора. Используй для добавления новых элементов к существующему треку.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Код для добавления в конец' },
        },
        required: ['code'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'setFullCode',
      description: 'Полностью заменить весь код в редакторе. Используй ТОЛЬКО для создания нового трека с нуля.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Полный код Strudel' },
        },
        required: ['code'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'playMusic',
      description: 'Запустить воспроизведение музыки. Используй после изменения кода.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'stopMusic',
      description: 'Остановить воспроизведение музыки.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'searchDocs',
      description: 'Поиск по документации Strudel. Используй чтобы найти информацию о функциях, синтаксисе, звуках.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Поисковый запрос' },
        },
        required: ['query'],
      },
    },
  },
];

const TOOLS_ANTHROPIC = TOOLS_OPENAI.map(t => ({
  name: t.function.name,
  description: t.function.description,
  input_schema: t.function.parameters,
}));

/**
 * Search documentation
 */
async function searchDocumentation(query: string, maxResults: number = 5): Promise<string[]> {
  const results: { file: string; content: string; score: number }[] = [];
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  const searchPaths = [
    path.join(DOCS_PATH, 'ru'),
    path.join(DOCS_PATH, 'en'),
  ];

  for (const searchPath of searchPaths) {
    try {
      await searchDirectory(searchPath, queryWords, queryLower, results);
    } catch (e) {
      // Skip if not found
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults).map(r => r.content);
}

async function searchDirectory(
  dir: string,
  queryWords: string[],
  queryLower: string,
  results: { file: string; content: string; score: number }[]
): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await searchDirectory(fullPath, queryWords, queryLower, results);
      } else if (entry.name.endsWith('.md')) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const contentLower = content.toLowerCase();

          let score = 0;
          if (contentLower.includes(queryLower)) score += 10;
          for (const word of queryWords) {
            const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
            score += Math.min(matches, 10);
          }

          if (entry.name.includes('mini-notation')) score += 15;
          if (entry.name.includes('effects')) score += 10;
          if (entry.name.includes('sounds')) score += 10;
          if (entry.name.includes('samples')) score += 10;
          if (entry.name.includes('synth')) score += 8;
          if (entry.name.includes('drum')) score += 8;

          if (score > 0) {
            const relevantContent = extractRelevantSection(content, queryWords, 2000);
            results.push({
              file: fullPath,
              content: `## ${entry.name}\n${relevantContent}`,
              score,
            });
          }
        } catch (e) { }
      }
    }
  } catch (e) { }
}

function extractRelevantSection(content: string, queryWords: string[], maxLength: number): string {
  const lines = content.split('\n');
  let bestStart = 0;
  let bestScore = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (lineLower.includes(word)) score += 5;
    }
    if (lines[i].startsWith('#')) score += 3;
    if (score > bestScore) {
      bestScore = score;
      bestStart = i;
    }
  }

  const startLine = Math.max(0, bestStart - 5);
  const section = lines.slice(startLine);

  let result = '';
  for (const line of section) {
    if (result.length + line.length > maxLength) break;
    result += line + '\n';
  }
  return result.trim();
}

/**
 * System prompt - artifact-style editing
 */
const SYSTEM_PROMPT = `Ты - Bulka AI, музыкальный агент для live coding музыки.

## ИНСТРУМЕНТЫ (используй их, не пиши код в тексте!):

### Работа с кодом (КАК АРТЕФАКТ):
- readCode - ВСЕГДА вызывай первым чтобы прочитать текущий код
- editCode(search, replace) - изменить конкретный фрагмент кода (найти и заменить)
- appendCode(code) - добавить код в конец
- setFullCode(code) - ТОЛЬКО для нового трека с нуля

### Воспроизведение:
- playMusic - запустить
- stopMusic - остановить

### Документация:
- searchDocs(query) - поиск по документации

## КРИТИЧЕСКИЕ ПРАВИЛА:
1. СНАЧАЛА вызови readCode чтобы увидеть что уже есть
2. НЕ ПЕРЕЗАПИСЫВАЙ весь код через setFullCode если можно отредактировать через editCode
3. Для добавления нового элемента используй appendCode или editCode
4. После изменений вызови playMusic

## Примеры паттернов Strudel:
- Бит: sound("bd sd hh sd")
- Множители: sound("bd*2 sd [hh hh hh] sd")
- Эффекты: sound("bd sd").room(0.5).delay(0.25)
- Мелодия: note("c3 e3 g3 c4").s("sawtooth")

`;

/**
 * Execute tool call server-side
 * Returns { result, isClientTool }
 */
function executeServerTool(name: string, args: any, currentCode: string): { result: string; isClientTool: boolean } {
  // Server-side tools
  if (name === 'searchDocs') {
    // Will be handled async separately
    return { result: '', isClientTool: false };
  }

  if (name === 'readCode') {
    return {
      result: currentCode || '// Редактор пуст',
      isClientTool: false
    };
  }

  // Client-side tools
  return { result: '', isClientTool: true };
}

/**
 * OpenAI agent loop with tool calling
 */
async function runOpenAIAgent(
  apiKey: string,
  model: string,
  messages: any[],
  currentCode: string
): Promise<ReadableStream> {
  const systemPrompt = SYSTEM_PROMPT + (currentCode ? `\n## Текущий код:\n\`\`\`\n${currentCode}\n\`\`\`` : '');

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let conversationMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
      ];

      let maxIterations = 5;

      while (maxIterations > 0) {
        maxIterations--;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: conversationMessages,
            tools: TOOLS_OPENAI,
            tool_choice: 'auto',
            stream: false, // Non-streaming for tool handling
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`));
          controller.close();
          return;
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const message = choice?.message;

        if (!message) {
          controller.close();
          return;
        }

        // Check for tool calls
        if (message.tool_calls && message.tool_calls.length > 0) {
          conversationMessages.push(message);

          for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function.name;
            let toolArgs: any = {};

            try {
              toolArgs = JSON.parse(toolCall.function.arguments || '{}');
            } catch (e) { }

            // Server-side tools
            if (toolName === 'readCode') {
              // Return current code to AI
              conversationMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: currentCode || '// Редактор пуст',
              });
            }
            else if (toolName === 'searchDocs') {
              const docs = await searchDocumentation(toolArgs.query || '', 3);
              conversationMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: docs.join('\n\n---\n\n') || 'Ничего не найдено',
              });
            }
            // Client-side tools - send to client for execution
            else {
              const toolCallData = {
                type: 'tool_call',
                name: toolName,
                args: toolArgs,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolCallData)}\n\n`));

              // Tell AI the tool was executed
              conversationMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `OK: ${toolName} выполнено`,
              });
            }
          }

          // Continue the loop to get AI's next response
          continue;
        }

        // No tool calls - send the text response
        if (message.content) {
          const textData = {
            type: 'text',
            content: message.content,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
        }

        // Done
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        return;
      }

      // Max iterations reached
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

/**
 * Anthropic agent loop with tool calling
 */
async function runAnthropicAgent(
  apiKey: string,
  model: string,
  messages: any[],
  currentCode: string
): Promise<ReadableStream> {
  const systemPrompt = SYSTEM_PROMPT + (currentCode ? `\n## Текущий код:\n\`\`\`\n${currentCode}\n\`\`\`` : '');

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let conversationMessages = [...messages];
      let maxIterations = 5;

      while (maxIterations > 0) {
        maxIterations--;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: conversationMessages,
            tools: TOOLS_ANTHROPIC,
            stream: false,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`));
          controller.close();
          return;
        }

        const data = await response.json();
        const content = data.content || [];

        let hasToolUse = false;
        let toolResults: any[] = [];

        for (const block of content) {
          if (block.type === 'text' && block.text) {
            const textData = {
              type: 'text',
              content: block.text,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
          }
          else if (block.type === 'tool_use') {
            hasToolUse = true;
            const toolName = block.name;
            const toolArgs = block.input || {};

            // Server-side tools
            if (toolName === 'readCode') {
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: currentCode || '// Редактор пуст',
              });
            }
            else if (toolName === 'searchDocs') {
              const docs = await searchDocumentation(toolArgs.query || '', 3);
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: docs.join('\n\n---\n\n') || 'Ничего не найдено',
              });
            }
            // Client-side tools
            else {
              const toolCallData = {
                type: 'tool_call',
                name: toolName,
                args: toolArgs,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolCallData)}\n\n`));

              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: `OK: ${toolName} выполнено`,
              });
            }
          }
        }

        if (hasToolUse && toolResults.length > 0) {
          // Add assistant response and tool results
          conversationMessages.push({
            role: 'assistant',
            content: content,
          });
          conversationMessages.push({
            role: 'user',
            content: toolResults,
          });
          continue;
        }

        // Done
        if (data.stop_reason === 'end_turn' || !hasToolUse) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages, apiKey, provider, model, currentCode } = body;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API ключ не указан' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let stream: ReadableStream;

    if (provider === 'anthropic') {
      stream = await runAnthropicAgent(apiKey, model || 'claude-sonnet-4-5-20250929', messages, currentCode || '');
    } else {
      stream = await runOpenAIAgent(apiKey, model || 'gpt-5.1', messages, currentCode || '');
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Внутренняя ошибка сервера' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
