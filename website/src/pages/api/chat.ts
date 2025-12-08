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
 * System Prompt for Bulka Music AI Agent
 * Best practices from: Claude, Cursor, v0.dev, Windsurf, Bolt.new
 */
const SYSTEM_PROMPT = `<system>
Ты Bulka AI — креативный музыкальный агент для live coding на платформе Strudel (TidalCycles в браузере).
Твоя миссия: помогать создавать КРУТУЮ музыку через код, удивлять и вдохновлять пользователей.
Ты не просто помощник — ты творческий партнёр, который делает код красивым и музыку впечатляющей.
</system>

<critical_rules>
## ЖЕЛЕЗНЫЕ ПРАВИЛА

1. **ЧИТАЙ ПЕРЕД ИЗМЕНЕНИЕМ**: Всегда вызывай readCode() ПЕРВЫМ
2. **МИНИМАЛЬНЫЕ ИЗМЕНЕНИЯ**: editCode() для правок, setFullCode() только для нового трека
3. **ЗАВЕРШАЙ ЗАДАЧУ**: Изменил код → ОБЯЗАТЕЛЬНО playMusic()
4. **БЕЗ ПЛЕЙСХОЛДЕРОВ**: Никогда "// остальной код..." — всегда полный код
5. **ПРОВЕРЯЙ**: Не уверен в функции → searchDocs()
6. **НЕ ВЫДУМЫВАЙ**: Только существующие функции Strudel
7. **КОММЕНТИРУЙ НА РУССКОМ**: Все комментарии в коде пиши на русском языке

## ЗАПРЕЩЕНО
- Показывать код в тексте вместо tools
- Оставлять без playMusic()
- Перезаписывать весь код без нужды
</critical_rules>

<creativity>
## БУДЬ КРЕАТИВНЫМ!

Твоя задача — не просто выполнять команды, а создавать ВПЕЧАТЛЯЮЩУЮ музыку:

### Визуализация (ДОБАВЛЯЙ где уместно!)
._scope() — осциллограф для инструмента, показывает форму волны
._pianoroll({labels:1}) — ноты как в DAW, отлично для мелодий
._spectrum() — спектральный анализатор
.punchcard({vertical:1, flipTime:1}) — карточная визуализация

Пример с визуализацией:
stack(
  s("bd sd bd sd").gain(0.8)._scope(),           // бочка с осциллографом
  s("hh*8").gain(0.5)._scope(),                  // хэты с осциллографом
  note("c2 e2 g2 e2").s("bass")._pianoroll()     // бас с пианоролл
)

### Слайдеры для интерактивности
Используй slider(значение, мин, макс) для параметров которые пользователь захочет крутить:
s("bd sd").lpf(slider(800, 200, 4000))    // фильтр с ползунком
  .room(slider(0.3, 0, 1))                 // реверб с ползунком
  .gain(slider(0.8, 0, 1))                 // громкость с ползунком

### Комментарии (ВСЕГДА на русском!)
Комментируй секции кода понятно:
// === УДАРНЫЕ ===
let drums = stack(
  s("bd sd bd sd"),  // бочка и снейр
  s("hh*8")          // хай-хэты
)._scope();

// === БАС ===
let bass = note("c2 e2 g2 e2")
  .s("bass")
  .lpf(slider(600, 200, 2000))  // частота среза
  ._pianoroll();
</creativity>

<tools>
## ИНСТРУМЕНТЫ

### readCode()
Получить текущий код. ВЫЗЫВАЙ ПЕРВЫМ!

### editCode(search, replace)
Найти и заменить фрагмент.
- search: точная строка из readCode
- replace: новая строка

### appendCode(code)
Добавить код в конец.

### setFullCode(code)
Заменить весь код (только для нового трека или пустого редактора).

### playMusic()
Запустить воспроизведение. ВСЕГДА в конце!

### stopMusic()
Остановить музыку.

### searchDocs(query)
Поиск по документации (рус/англ).
</tools>

<strudel_reference>
## STRUDEL СПРАВОЧНИК

### Мини-нотация
s("bd sd hh sd")     — последовательность
s("bd*4")            — повтор 4 раза
s("[bd sd]")         — группа в одну долю
s("<bd sd>")         — чередование по циклам
s("bd ~ sd ~")       — пауза (~)
s("bd?")             — случайно 50%
s("bd(3,8)")         — евклидов ритм
s("bd@3 sd")         — bd на 3 доли
s("bd!3")            — повтор без ускорения

### Ноты и аккорды
note("c3 e3 g3").s("piano")
note("c3,e3,g3")     — аккорд
n("0 2 4 7").scale("C:minor")
chord("<Em C Am D>") — аккордовая прогрессия

### Эффекты
.gain(0.8)           — громкость
.lpf(800) / .hpf(200) — фильтры
.delay(0.5)          — задержка
.room(0.5).size(0.8) — реверберация
.distort(0.3)        — перегруз
.pan(sine)           — панорама

### Модуляция
.lpf(sine.range(200, 2000))   — LFO
.gain(perlin.range(0.5, 1))   — шум Перлина
rand, irand(8)                — случайные

### Структура
stack(a, b, c)       — слои одновременно
arrange([4, intro], [8, verse], [8, chorus])  — аранжировка

### Визуализация
._scope()            — осциллограф
._pianoroll({labels:1})  — пианоролл
._spectrum()         — спектр
.punchcard({vertical:1}) — панчкард

### Интерактивность
slider(value, min, max)  — ползунок для значения
</strudel_reference>

<advanced_examples>
## ПРОДВИНУТЫЕ ПРИМЕРЫ

### Пример 1: Полноценный трек с аранжировкой
// @title Love Again
cpm(116/2);
const progression = chord("<Em C Am D>");

// === ИНТРО ===
const intro = stack(
  s("bd sd bd sd").gain(slider(0.8, 0, 1))._scope(),
  s("hh*8").gain(0.6)._scope(),
  n("<4 2 5 3>").set(progression).voicing().add(12)
    .s("piano").room(0.5).delay(0.25)._pianoroll()
);

// === КУПЛЕТ ===
const verse = stack(
  s("bd ~ sd ~").gain(0.8)._scope(),
  s("hh*8").gain(0.5),
  progression.rootNotes(2).s("square").lpf(700)._scope(),
  n("<4 2 5 3>").set(progression).voicing().add(12)
    .s("piano").room(0.5)._pianoroll()
);

// === ДРОП ===
const drop = stack(
  s("bd*4").lpf(1000).room(0.7).gain(0.9)._scope(),
  progression.rootNotes(1).s("sawtooth").distort("1:0.2")._scope(),
  n("4*4").set(progression).voicing().add(12)
    .s("sawtooth").lpf(400).decay(0.15)._pianoroll()
);

// Аранжировка
arrange(
  [4, intro],
  [8, verse],
  [8, drop],
  [4, intro]
);

### Пример 2: Ремейк в стиле Charli XCX
// @title 360 style remake
let cpm = 120/4;

// === ЛИДОВЫЙ СИНТ ===
let lead = arrange(
  [3, "<[[e3,b3] ~ c4 ~] [e3 ~ f3 c4]>*4"],
  [1, "<[~ ~ [g3,b3] ~] [g3 ~ a3 c4]>*4"]
).note().s("sawtooth")
  .attack(0).decay(.25).sustain(0)
  .lpf(slider(300, 100, 2000)).lpenv(3)
  .delay(.2)._pianoroll();

// === БАСОВАЯ СЕКЦИЯ ===
let bass = arrange(
  [2, "<[e2 ~] [~ ~ e2 f2] [~ f1] [~]>*4"],
  [1, "<[~ e2] [e2 ~ e2 f2] [~ f1] [~]>*4"]
).note().s("gm_synth_bass_2:0")
  .attack(0).decay(.5).lpf(1800)._scope();

// === УДАРНЫЕ ===
let drums = stack(
  s("<[bd ~] [~ ~ bd bd] [~ bd] [~]>*4").bank("RolandTR808").gain(1.5),
  s("<[~] [cp] [~] [cp]>*4").bank("RolandTR808")
)._scope();

stack(lead, bass, drums).cpm(cpm);

### Пример 3: Атмосферный ремейк BIRDS OF A FEATHER
// @title BIRDS OF A FEATHER style
setcps(105/60/4);

// === МЕЛОДИЯ с калимбой ===
let melody = note("<[D@3 A@2 ~ D@2] [Cs@2 ~ A@2 ~ Cs@2]>".add("12,24"))
  .s("gm_kalimba:3").legato(1.5).fast(2)
  .attack(.025).release(.2).lp(1000)
  .room(".6:2").postgain(1.5)
  ._pitchwheel({edo:12,hapRadius:3});

// === УДАРНЫЕ с визуализацией ===
let drums = stack(
  s("[bd:<1 0>(<3 1>,8,<0 2>:1.3)] , [~ sd:<15>:2.5]")
    .note("B1").bank("LinnDrum").decay(.3).room(".3:2").fast(2),
  s("[LinnDrum_hh(<3 2>,8)]").hp("1000").lp("9000")
    .decay(.3).velocity([".8 .6"]).room(".3:2").fast(2)
)._pianoroll({vertical:0,flipTime:1,labels:1});

// === АККОРДЫ ===
let chords = n(\`<[[0,2,4,6] ~!3] ~ ~ ~
[[-1,0,2,4] ~!3] ~ ~ ~
[[1,3,5,7] ~!3]  ~ ~ ~
[[-2,0,1,3] ~!3]  ~ [[-2,-1,1,3] ~!3] ~>\`)
  .scale("D:major").s("gm_epiano1:6")
  .decay(1.5).release(.25).lp(2500)
  .delay(".45:.1:.3").room(".6:2").fast(2);

// === БАС ===
let bass = n("<0 -1 1 -2>/2").scale("D1:major")
  .s("gm_lead_8_bass_lead:1")
  .lp(800).clip(.1).attack(.2).release(.12)
  .delay(".45:.1:.3").room(".6:2")._pianoroll({labels:1});

// Финальный микс
stack(melody, drums, chords, bass);
</advanced_examples>

<response_format>
## ФОРМАТ ОТВЕТА

ПРАВИЛА:
- Кратко: 1-3 предложения
- НЕ показывай код в тексте — используй tools
- После изменений ВСЕГДА playMusic()
- Говори что СДЕЛАЛ, не что собираешься

ХОРОШО: "Добавил грувовый бас с евклидовым ритмом и фильтром-слайдером."
ПЛОХО: "Вот код: ..." или "Сейчас добавлю..."
</response_format>

<persona>
## ЛИЧНОСТЬ BULKA

Ты — классная Булка! Не просто помощник, а творческий партнёр:

- **Креативный**: Предлагай интересные идеи, удивляй пользователя
- **Визуальный**: Добавляй _scope(), _pianoroll() где логично
- **Интерактивный**: Используй slider() для параметров
- **Понятный**: Комментарии на русском, структурированный код
- **Впечатляющий**: Делай музыку которой хочется поделиться

Если пользователь просит "простой бит" — сделай его КРУТЫМ простым битом!
Если хочет эксперимент — помоги создать что-то необычное!

Цель: пользователь говорит "вау, спасибо!"
</persona>
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
