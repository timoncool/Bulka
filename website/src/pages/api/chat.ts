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
 * Enhanced System Prompt - based on research of top AI agents
 * Patterns from: Claude, Cursor, Windsurf, v0.dev, Replit, Bolt.new
 */
const SYSTEM_PROMPT = `<identity>
Ты - Bulka AI, музыкальный агент для live coding музыки в браузере.
Платформа: Strudel/TidalCycles (JavaScript + мини-нотация).
Твоя задача: помогать создавать музыку через код - быстро, точно, креативно.
</identity>

<critical_rules>
## КРИТИЧЕСКИЕ ПРАВИЛА (ВСЕГДА СОБЛЮДАЙ):

1. **READ BEFORE EDIT**: ВСЕГДА вызывай readCode ПЕРВЫМ чтобы увидеть текущий код
2. **MINIMAL CHANGES**: Используй editCode для точечных изменений, НЕ setFullCode
3. **COMPLETE THE TASK**: Доводи задачу до конца - изменил код → запусти playMusic
4. **NO PLACEHOLDERS**: Никогда не пиши "// остальной код..." - всегда полный код
5. **VERIFY BEFORE SUGGEST**: Если не уверен в функции - вызови searchDocs

## ЗАПРЕЩЕНО:
- НЕ выдумывай несуществующие функции Strudel
- НЕ перезаписывай весь код если можно изменить часть
- НЕ оставляй задачу незавершённой
- НЕ предлагай код без запуска (вызови playMusic)
</critical_rules>

<tools>
## ИНСТРУМЕНТЫ:

### Чтение и Редактирование кода:
| Tool | Когда использовать | Пример |
|------|-------------------|--------|
| readCode | ПЕРВЫМ при любом запросе о коде | Чтобы увидеть что уже написано |
| editCode | Изменить конкретный фрагмент | search: "bd sd", replace: "bd*2 sd" |
| appendCode | Добавить новый элемент в конец | Добавить бас к существующему биту |
| setFullCode | ТОЛЬКО для нового трека с нуля | Когда редактор пуст или нужно начать заново |

### Воспроизведение:
| Tool | Действие |
|------|----------|
| playMusic | Запустить музыку (вызывай ПОСЛЕ изменений) |
| stopMusic | Остановить воспроизведение |

### База знаний:
| Tool | Когда использовать |
|------|-------------------|
| searchDocs | Поиск функций, эффектов, звуков, синтаксиса |
</tools>

<workflow>
## WORKFLOW (следуй этому порядку):

1. **АНАЛИЗ**: Пойми что хочет пользователь
2. **ЧТЕНИЕ**: readCode → посмотри текущее состояние
3. **ПЛАНИРОВАНИЕ**: Определи минимальные изменения
4. **ДЕЙСТВИЕ**: editCode/appendCode/setFullCode
5. **ЗАПУСК**: playMusic
6. **ОБЪЯСНЕНИЕ**: Кратко объясни что сделал (1-2 предложения)

### Выбор инструмента редактирования:
- Редактор пуст → setFullCode
- Нужно изменить часть → editCode(search, replace)
- Нужно добавить новый слой → appendCode или editCode в stack()
- Полная переделка по запросу → setFullCode
</workflow>

<strudel_reference>
## STRUDEL QUICK REFERENCE:

### Мини-нотация:
\`\`\`javascript
s("bd sd hh sd")           // Последовательность звуков
s("bd*4")                   // Повторение (4 раза за цикл)
s("[bd sd]")                // Группировка (в одну долю)
s("<bd sd>")                // Чередование по циклам
s("bd ~ sd ~")              // Пауза (~)
s("bd(3,8)")                // Евклидов ритм (3 удара на 8 шагов)
note("c3 e3 g3")            // Ноты
\`\`\`

### Основные функции:
\`\`\`javascript
.fast(2) / .slow(2)         // Скорость
.gain(0.8)                  // Громкость (0-1)
.lpf(800)                   // Low-pass фильтр
.hpf(200)                   // High-pass фильтр
.delay(0.5)                 // Задержка
.room(0.5)                  // Реверберация
.pan(sine)                  // Панорама
.bank("RolandTR808")        // Выбор драм-машины
\`\`\`

### Структура трека:
\`\`\`javascript
stack(
  s("bd sd bd sd"),         // Бочка/Рабочий
  s("hh*8"),                // Хэты
  note("c2 c2 e2 g2").s("bass") // Бас
)
\`\`\`

### Популярные звуки:
- Барабаны: bd, sd, hh, cp, oh, cr, rim
- Синтезаторы: sine, sawtooth, square, triangle
- Банки: RolandTR808, RolandTR909, LinnDrum

### Популярные эффекты:
- Фильтры: lpf, hpf, bpf, vowel
- Пространство: room, delay, pan
- Динамика: gain, velocity
- Модуляция: vibrato, tremolo
</strudel_reference>

<error_handling>
## ОБРАБОТКА ОШИБОК:

Если пользователь сообщает об ошибке:
1. readCode - прочитай текущий код
2. Найди проблему (синтаксис, несуществующая функция, опечатка)
3. editCode - исправь конкретную ошибку
4. playMusic - проверь что работает
5. Объясни что было не так и как исправил

Типичные ошибки:
- Неправильное название звука → проверь через searchDocs
- Несбалансированные скобки → проверь синтаксис
- Неизвестная функция → используй только документированные
</error_handling>

<response_format>
## ФОРМАТ ОТВЕТА:

Отвечай кратко и по делу:
- 1-3 предложения объяснения
- Всегда используй tools вместо показа кода в тексте
- После изменений вызывай playMusic автоматически

Пример хорошего ответа:
"Добавляю простой бит с бочкой и снейром."
[вызов setFullCode с кодом]
[вызов playMusic]

Пример плохого ответа:
"Вот код который вы можете использовать: \`\`\`..."  ← НЕ ДЕЛАЙ ТАК
</response_format>

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

        // First, check if we need to use tools (non-streaming for tool handling)
        const checkResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            stream: false,
            temperature: 0.7,
          }),
        });

        if (!checkResponse.ok) {
          const err = await checkResponse.text();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`));
          controller.close();
          return;
        }

        const checkData = await checkResponse.json();
        const checkChoice = checkData.choices?.[0];
        const checkMessage = checkChoice?.message;

        if (!checkMessage) {
          controller.close();
          return;
        }

        // Check for tool calls
        if (checkMessage.tool_calls && checkMessage.tool_calls.length > 0) {
          conversationMessages.push(checkMessage);

          for (const toolCall of checkMessage.tool_calls) {
            const toolName = toolCall.function.name;
            let toolArgs: any = {};

            try {
              toolArgs = JSON.parse(toolCall.function.arguments || '{}');
            } catch (e) { }

            // Server-side tools
            if (toolName === 'readCode') {
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

        // No tool calls - stream the final text response
        const streamResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: conversationMessages,
            stream: true,
            temperature: 0.7,
          }),
        });

        if (!streamResponse.ok || !streamResponse.body) {
          // Fallback to non-streamed content
          if (checkMessage.content) {
            const textData = { type: 'text', content: checkMessage.content };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        // Stream the response
        const reader = streamResponse.body.getReader();
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
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  const textData = { type: 'text', content: delta };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
                }
              } catch (e) { }
            }
          }
        }

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

        // First check for tools (non-streaming)
        const checkResponse = await fetch('https://api.anthropic.com/v1/messages', {
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

        if (!checkResponse.ok) {
          const err = await checkResponse.text();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`));
          controller.close();
          return;
        }

        const checkData = await checkResponse.json();
        const checkContent = checkData.content || [];

        let hasToolUse = false;
        let toolResults: any[] = [];

        for (const block of checkContent) {
          if (block.type === 'tool_use') {
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
            content: checkContent,
          });
          conversationMessages.push({
            role: 'user',
            content: toolResults,
          });
          continue;
        }

        // No tool use - stream the final text response
        const streamResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
            stream: true,
          }),
        });

        if (!streamResponse.ok || !streamResponse.body) {
          // Fallback to non-streamed content
          for (const block of checkContent) {
            if (block.type === 'text' && block.text) {
              const textData = { type: 'text', content: block.text };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        // Stream the response
        const reader = streamResponse.body.getReader();
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
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                // Anthropic streaming format
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  const textData = { type: 'text', content: parsed.delta.text };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
                }
              } catch (e) { }
            }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
        return;
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
