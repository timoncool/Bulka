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
  {
    type: 'function' as const,
    function: {
      name: 'highlightCode',
      description: 'Выделить (подсветить) фрагмент кода в редакторе чтобы показать пользователю. Используй когда пользователь спрашивает "где", "покажи", "найди".',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Текст для поиска и выделения в коде (точное совпадение)' },
        },
        required: ['search'],
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
Ты Bulka AI — креативный музыкальный агент для live coding на платформе Bulka (форк Strudel/TidalCycles).

ВАЖНО О ТВОЕЙ ИДЕНТИЧНОСТИ:
- Ты — БУЛКА, а НЕ Strudel. Никогда не называй себя Strudel!
- Bulka — это русскоязычный форк Strudel с AI-агентом и улучшенным интерфейсом
- Strudel — это "старший брат", первоисточник, но ты — Bulka!
- Сервис называется Bulka, редактор называется Bulka, ты — Bulka AI

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
- ВЫДУМЫВАТЬ НАЗВАНИЯ СЭМПЛ-ПАКОВ! Это критическая ошибка!

## СЭМПЛЫ И БАНКИ — КРИТИЧЕСКИ ВАЖНО!
- НИКОГДА не придумывай названия сэмпл-паков из головы!
- Перед использованием samples() или bank() — ВСЕГДА searchDocs("samples") или searchDocs("bank")
- Используй ТОЛЬКО реальные банки из документации: RolandTR808, RolandTR909, LinnDrum, и т.д.
- Если нужен кастомный пак — сначала searchDocs() чтобы найти доступные
- Названия вроде "oneheart_ambient_sample_pack" НЕ СУЩЕСТВУЮТ — не выдумывай!
- При сомнениях — используй встроенные звуки: s("bd"), s("sd"), s("hh"), note().s("piano")

## ДОВЕРЯЙ ПОЛЬЗОВАТЕЛЮ
- Если пользователь говорит что звук пропал или что-то сломалось — ВЕРЬ ЕМУ
- НЕ СПОРЬ с пользователем, не доказывай что "всё работает"
- Пользователь слышит и видит результат, а ты — нет
- Если пользователь жалуется — сразу ищи проблему и исправляй

## РАБОТА С ВЫДЕЛЕНИЕМ
- Если пользователь выделил код — он хочет работать ТОЛЬКО с этим фрагментом
- Сфокусируйся на выделенном коде, отвечай про него
- При редактировании выделенного кода — редактируй именно его через editCode()
- Если выделение есть — это приоритет, не трогай остальной код без необходимости
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

### highlightCode(search)
Найти и выделить фрагмент кода в редакторе чтобы показать пользователю.
Используй когда спрашивают "где", "покажи", "найди в коде".
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

### Пример 4: Coastline - компактный но богатый трек
// "coastline" @by eddyflux
samples('github:eddyflux/crate')
setcps(.75)
let chords = chord("<Bbm9 Fm9>/4").dict('ireal')
stack(
  stack( // === УДАРНЫЕ ===
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.5)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  , // === АККОРДЫ ===
  chords.offset(-1).voicing().s("gm_epiano1:1")
  .phaser(4).room(.5)
  , // === МЕЛОДИЯ ===
  n("<0!3 1*2>").set(chords).mode("root:g2")
  .voicing().s("gm_acoustic_bass"),
  chords.n("[0 <4 3 <2 5>>*2](<3 5>,8)")
  .anchor("D5").voicing()
  .segment(4).clip(rand.range(.4,.8))
  .room(.75).shape(.3).delay(.25)
  .fm(sine.range(3,8).slow(8))
  .lpf(sine.range(500,1000).slow(8)).lpq(5)
  .rarely(ply("2")).chunk(4, fast(2))
  .gain(perlin.range(.6, .9))
  .mask("<0 1 1 0>/16")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)
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
  currentCode: string,
  selectedCode: string | null
): Promise<ReadableStream> {
  let codeContext = '';
  if (selectedCode) {
    codeContext = `\n## Выделенный код (пользователь выделил этот фрагмент):\n\`\`\`\n${selectedCode}\n\`\`\`\n## Полный код:\n\`\`\`\n${currentCode}\n\`\`\``;
  } else if (currentCode) {
    codeContext = `\n## Текущий код:\n\`\`\`\n${currentCode}\n\`\`\``;
  }
  const systemPrompt = SYSTEM_PROMPT + codeContext;

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

        // Check if model is a reasoning model (o1, o3, o4) - they don't support temperature/tools
        const isReasoningModel = model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4');

        // Build request body conditionally
        const checkBody: any = {
          model,
          messages: conversationMessages,
          stream: false,
        };

        // Add tools only for non-reasoning models
        if (!isReasoningModel) {
          checkBody.tools = TOOLS_OPENAI;
          checkBody.tool_choice = 'auto';
          checkBody.temperature = 0.7;
        }

        // First, check if we need to use tools (non-streaming for tool handling)
        const checkResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(checkBody),
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
              // Send status to client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: '📖 Читаю код...' })}\n\n`));
              conversationMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: currentCode || '// Редактор пуст',
              });
            }
            else if (toolName === 'searchDocs') {
              // Send status to client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: `🔍 Ищу в документации: "${toolArgs.query}"...` })}\n\n`));
              const docs = await searchDocumentation(toolArgs.query || '', 3);
              conversationMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: docs.join('\n\n---\n\n') || 'Ничего не найдено',
              });
            }
            // Client-side tools - send to client for execution
            else {
              // Send status based on tool type
              let statusMessage = '';
              if (toolName === 'setFullCode') statusMessage = '✏️ Устанавливаю код...';
              else if (toolName === 'editCode') statusMessage = '✏️ Редактирую код...';
              else if (toolName === 'appendCode') statusMessage = '➕ Добавляю код...';
              else if (toolName === 'playMusic') statusMessage = '▶️ Запускаю воспроизведение...';
              else if (toolName === 'stopMusic') statusMessage = '⏹️ Останавливаю...';

              if (statusMessage) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: statusMessage })}\n\n`));
              }

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
        // Build streaming request body (no temperature for reasoning models)
        const streamBody: any = {
          model,
          messages: conversationMessages,
          stream: true,
        };

        if (!isReasoningModel) {
          streamBody.temperature = 0.7;
        }

        const streamResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(streamBody),
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
  currentCode: string,
  selectedCode: string | null
): Promise<ReadableStream> {
  let codeContext = '';
  if (selectedCode) {
    codeContext = `\n## Выделенный код (пользователь выделил этот фрагмент):\n\`\`\`\n${selectedCode}\n\`\`\`\n## Полный код:\n\`\`\`\n${currentCode}\n\`\`\``;
  } else if (currentCode) {
    codeContext = `\n## Текущий код:\n\`\`\`\n${currentCode}\n\`\`\``;
  }
  const systemPrompt = SYSTEM_PROMPT + codeContext;

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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: '📖 Читаю код...' })}\n\n`));
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: currentCode || '// Редактор пуст',
              });
            }
            else if (toolName === 'searchDocs') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: `🔍 Ищу в документации: "${toolArgs.query}"...` })}\n\n`));
              const docs = await searchDocumentation(toolArgs.query || '', 3);
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: docs.join('\n\n---\n\n') || 'Ничего не найдено',
              });
            }
            // Client-side tools
            else {
              // Send status based on tool type
              let statusMessage = '';
              if (toolName === 'setFullCode') statusMessage = '✏️ Устанавливаю код...';
              else if (toolName === 'editCode') statusMessage = '✏️ Редактирую код...';
              else if (toolName === 'appendCode') statusMessage = '➕ Добавляю код...';
              else if (toolName === 'playMusic') statusMessage = '▶️ Запускаю воспроизведение...';
              else if (toolName === 'stopMusic') statusMessage = '⏹️ Останавливаю...';

              if (statusMessage) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: statusMessage })}\n\n`));
              }

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

        // No tool use - stream the final text response with extended thinking
        // Check if model supports thinking (claude-sonnet-4, claude-opus-4, etc.)
        const supportsThinking = model.includes('sonnet-4') || model.includes('opus-4') || model.includes('claude-4');

        const streamBody: any = {
          model,
          max_tokens: 16000,
          system: systemPrompt,
          messages: conversationMessages,
          stream: true,
        };

        // Enable extended thinking for supported models
        if (supportsThinking) {
          streamBody.thinking = {
            type: 'enabled',
            budget_tokens: 8000,
          };
        }

        const streamHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        };

        // Add interleaved thinking beta header for Claude 4 models
        if (supportsThinking) {
          streamHeaders['anthropic-beta'] = 'interleaved-thinking-2025-05-14';
        }

        const streamResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: streamHeaders,
          body: JSON.stringify(streamBody),
        });

        if (!streamResponse.ok || !streamResponse.body) {
          // Log the error for debugging
          const errorText = await streamResponse.text().catch(() => 'Unknown error');
          console.error('[Chat] Stream response error:', streamResponse.status, errorText);

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
        let isInThinkingBlock = false;

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

                // Track thinking block state
                if (parsed.type === 'content_block_start') {
                  if (parsed.content_block?.type === 'thinking') {
                    isInThinkingBlock = true;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_start' })}\n\n`));
                  } else if (parsed.content_block?.type === 'text') {
                    isInThinkingBlock = false;
                  }
                }

                // Handle thinking delta (extended thinking content)
                if (parsed.type === 'content_block_delta') {
                  if (parsed.delta?.type === 'thinking_delta' && parsed.delta?.thinking) {
                    const thinkingData = { type: 'thinking', content: parsed.delta.thinking };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(thinkingData)}\n\n`));
                  }
                  // Handle text delta (final response)
                  else if (parsed.delta?.type === 'text_delta' && parsed.delta?.text) {
                    const textData = { type: 'text', content: parsed.delta.text };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
                  }
                  // Legacy format support
                  else if (parsed.delta?.text) {
                    const textData = { type: 'text', content: parsed.delta.text };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
                  }
                }

                // Mark end of thinking block
                if (parsed.type === 'content_block_stop' && isInThinkingBlock) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_end' })}\n\n`));
                  isInThinkingBlock = false;
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

/**
 * Gemini agent loop with tool calling
 */
async function runGeminiAgent(
  apiKey: string,
  model: string,
  messages: any[],
  currentCode: string,
  selectedCode: string | null
): Promise<ReadableStream> {
  let codeContext = '';
  if (selectedCode) {
    codeContext = `\n## Выделенный код (пользователь выделил этот фрагмент):\n\`\`\`\n${selectedCode}\n\`\`\`\n## Полный код:\n\`\`\`\n${currentCode}\n\`\`\``;
  } else if (currentCode) {
    codeContext = `\n## Текущий код:\n\`\`\`\n${currentCode}\n\`\`\``;
  }
  const systemPrompt = SYSTEM_PROMPT + codeContext;

  const encoder = new TextEncoder();

  // Convert messages to Gemini format
  const geminiContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Gemini tools format
  const geminiTools = [{
    function_declarations: TOOLS_OPENAI.map(t => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    })),
  }];

  return new ReadableStream({
    async start(controller) {
      let conversationContents = [...geminiContents];
      let maxIterations = 5;

      while (maxIterations > 0) {
        maxIterations--;

        // Call Gemini API
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: conversationContents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            tools: geminiTools,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`));
          controller.close();
          return;
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const content = candidate?.content;

        if (!content) {
          controller.close();
          return;
        }

        // Check for function calls
        const functionCalls = content.parts?.filter((p: any) => p.functionCall);

        if (functionCalls && functionCalls.length > 0) {
          conversationContents.push(content);

          const functionResponses: any[] = [];

          for (const part of functionCalls) {
            const fc = part.functionCall;
            const toolName = fc.name;
            const toolArgs = fc.args || {};

            // Server-side tools
            if (toolName === 'readCode') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: '📖 Читаю код...' })}\n\n`));
              functionResponses.push({
                functionResponse: {
                  name: toolName,
                  response: { content: currentCode || '// Редактор пуст' },
                },
              });
            }
            else if (toolName === 'searchDocs') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: `🔍 Ищу в документации: "${toolArgs.query}"...` })}\n\n`));
              const docs = await searchDocumentation(toolArgs.query || '', 3);
              functionResponses.push({
                functionResponse: {
                  name: toolName,
                  response: { content: docs.join('\n\n---\n\n') || 'Ничего не найдено' },
                },
              });
            }
            // Client-side tools
            else {
              let statusMessage = '';
              if (toolName === 'setFullCode') statusMessage = '✏️ Устанавливаю код...';
              else if (toolName === 'editCode') statusMessage = '✏️ Редактирую код...';
              else if (toolName === 'appendCode') statusMessage = '➕ Добавляю код...';
              else if (toolName === 'playMusic') statusMessage = '▶️ Запускаю воспроизведение...';
              else if (toolName === 'stopMusic') statusMessage = '⏹️ Останавливаю...';

              if (statusMessage) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: statusMessage })}\n\n`));
              }

              const toolCallData = {
                type: 'tool_call',
                name: toolName,
                args: toolArgs,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolCallData)}\n\n`));

              functionResponses.push({
                functionResponse: {
                  name: toolName,
                  response: { content: `OK: ${toolName} выполнено` },
                },
              });
            }
          }

          // Add function responses
          conversationContents.push({
            role: 'user',
            parts: functionResponses,
          });

          continue;
        }

        // No function calls - stream text response
        const textParts = content.parts?.filter((p: any) => p.text);
        for (const part of textParts || []) {
          if (part.text) {
            const textData = { type: 'text', content: part.text };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(textData)}\n\n`));
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

/**
 * Truncate messages to avoid rate limits
 * Keep last N messages, prioritizing recent context
 */
function truncateMessages(messages: any[], maxMessages: number = 10): any[] {
  if (messages.length <= maxMessages) return messages;
  // Keep first message (might have important context) and last N-1 messages
  return [messages[0], ...messages.slice(-(maxMessages - 1))];
}

/**
 * Truncate code to avoid token overflow
 */
function truncateCode(code: string, maxChars: number = 4000): string {
  if (!code || code.length <= maxChars) return code;
  return code.slice(0, maxChars) + '\n// ... (код сокращён для экономии токенов)';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    let { messages, apiKey, provider, model, currentCode, selectedCode } = body;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API ключ не указан' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Truncate to avoid rate limits
    messages = truncateMessages(messages, 10);
    currentCode = truncateCode(currentCode || '', 4000);
    if (selectedCode) {
      selectedCode = truncateCode(selectedCode, 2000);
    }

    let stream: ReadableStream;

    if (provider === 'anthropic') {
      stream = await runAnthropicAgent(apiKey, model || 'claude-sonnet-4-5-20250514', messages, currentCode || '', selectedCode || null);
    } else if (provider === 'gemini') {
      stream = await runGeminiAgent(apiKey, model || 'gemini-2.5-pro-preview-06-05', messages, currentCode || '', selectedCode || null);
    } else {
      stream = await runOpenAIAgent(apiKey, model || 'gpt-4.1', messages, currentCode || '', selectedCode || null);
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
