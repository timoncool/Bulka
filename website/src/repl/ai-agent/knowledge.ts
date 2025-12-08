/**
 * Knowledge base system for the Bulka Music AI Agent
 * Provides search functionality over MD documentation
 */

// Pre-indexed knowledge chunks for quick search
// This is a simplified RAG implementation using keyword matching
// For production, consider using proper embeddings with OpenAI or local models

interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
  category: 'syntax' | 'sounds' | 'effects' | 'functions' | 'examples' | 'general';
  keywords: string[];
}

/**
 * Core knowledge about Strudel syntax and functions
 * This is pre-extracted from the MD documentation for fast access
 */
export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  // Mini-notation
  {
    id: 'mini-notation-basics',
    title: 'Основы мини-нотации',
    content: `Мини-нотация - это компактный способ записи паттернов в Strudel.

Основные элементы:
- Пробелы разделяют события в цикле: \`s("bd sd hh sd")\`
- Квадратные скобки группируют в одну долю: \`s("bd [sd sd]")\`
- Звездочка умножает (ускоряет): \`s("bd*4")\` - 4 удара бочки
- Слэш делит (замедляет): \`s("bd/2")\` - один удар на 2 цикла
- Угловые скобки чередуют по циклам: \`s("<bd sd>")\`
- Тильда - пауза: \`s("bd ~ sd ~")\`
- Запятая - полифония: \`s("[bd,sd,hh]")\`
- Восклицательный знак - повтор без ускорения: \`s("bd!4")\`
- Вопросительный знак - 50% вероятность: \`s("bd?")\`
- Вертикальная черта - случайный выбор: \`s("bd|sd|hh")\`

Евклидов ритм:
- \`s("bd(3,8)")\` - 3 удара распределены на 8 долей`,
    category: 'syntax',
    keywords: ['мини-нотация', 'синтаксис', 'паттерн', 'mini notation', 'pattern', 'скобки', 'brackets'],
  },
  {
    id: 'notes',
    title: 'Работа с нотами',
    content: `Ноты в Strudel можно записывать несколькими способами:

1. Буквенная нотация с октавой:
   \`note("c4 e4 g4")\` - до, ми, соль в 4-й октаве
   \`note("c#4 eb4")\` - диез и бемоль

2. MIDI числа:
   \`note("60 64 67")\` - те же ноты через MIDI

3. С синтезатором:
   \`note("c4 e4 g4").s("sine")\`
   \`note("c4 e4 g4").s("sawtooth")\`

4. Аккорды:
   \`chord("Am F C G")\` - последовательность аккордов
   \`n("0").chord("Am").voicing()\` - с voicing

5. Гаммы:
   \`n("0 2 4 5 7").scale("C:major")\`
   \`n("0 1 2 3 4 5 6 7").scale("D:minor")\``,
    category: 'syntax',
    keywords: ['ноты', 'note', 'аккорды', 'chord', 'гамма', 'scale', 'midi'],
  },
  {
    id: 'sounds-drums',
    title: 'Барабанные звуки',
    content: `Основные барабанные звуки в Strudel:

Бочки (Kick/Bass Drum):
- \`bd\` - стандартная бочка
- \`808bd\` - 808 бочка

Рабочий (Snare):
- \`sd\` - стандартный снэйр
- \`sn\` - альтернативный снэйр
- \`cp\` - хлопок (clap)

Хай-хэт (Hi-Hat):
- \`hh\` - закрытый хай-хэт
- \`hc\` - закрытый хай-хэт
- \`ho\` или \`oh\` - открытый хай-хэт

Тарелки:
- \`cr\` - крэш
- \`cc\` - крэш cymbal

Томы:
- \`ht\` - высокий том
- \`mt\` - средний том
- \`lt\` - низкий том

Перкуссия:
- \`cb\` - cowbell
- \`rm\` - rimshot
- \`tabla\` - табла

Пример простого бита:
\`\`\`
stack(
  s("bd ~ bd ~"),
  s("~ sd ~ sd"),
  s("hh*8")
)
\`\`\``,
    category: 'sounds',
    keywords: ['барабаны', 'drums', 'бочка', 'kick', 'снэйр', 'snare', 'хэт', 'hihat', 'bd', 'sd', 'hh'],
  },
  {
    id: 'sounds-synths',
    title: 'Синтезаторы',
    content: `Встроенные синтезаторы в Strudel:

Основные волновые формы:
- \`sine\` - синусоида (мягкий звук)
- \`sawtooth\` - пила (резкий, богатый гармониками)
- \`square\` - квадрат (гудящий звук)
- \`triangle\` - треугольник (между синусом и квадратом)

Шумы:
- \`white\` - белый шум
- \`pink\` - розовый шум
- \`brown\` - коричневый шум

Использование:
\`\`\`
note("c3 e3 g3").s("sine")
note("c2").s("sawtooth").lpf(500)
s("white").gain(0.3)
\`\`\`

С огибающей:
\`\`\`
note("c3").s("sawtooth")
  .attack(0.01)
  .decay(0.2)
  .sustain(0.5)
  .release(0.3)
\`\`\``,
    category: 'sounds',
    keywords: ['синтезатор', 'synth', 'sine', 'sawtooth', 'square', 'волна', 'wave', 'осциллятор'],
  },
  {
    id: 'effects-filter',
    title: 'Фильтры',
    content: `Фильтры в Strudel:

Low-Pass Filter (пропускает низкие частоты):
\`\`\`
s("sawtooth").lpf(500)  // cutoff 500 Hz
s("sawtooth").lpf(sine.range(200, 2000).slow(4))  // модуляция
s("sawtooth").lpf(800).lpq(10)  // с резонансом
\`\`\`

High-Pass Filter (пропускает высокие частоты):
\`\`\`
s("bd sd").hpf(200)
\`\`\`

Band-Pass Filter:
\`\`\`
s("noise").bandpass(1000)
\`\`\`

Vowel Filter (гласные звуки):
\`\`\`
s("sawtooth").vowel("<a e i o u>")
\`\`\`

Фильтровая огибающая:
\`\`\`
note("c2").s("sawtooth")
  .lpf(100)
  .lpenv(6)        // глубина огибающей
  .lpattack(0.01)
  .lpdecay(0.2)
  .lpsustain(0.5)
  .lprelease(0.3)
\`\`\``,
    category: 'effects',
    keywords: ['фильтр', 'filter', 'lpf', 'hpf', 'cutoff', 'резонанс', 'resonance', 'vowel'],
  },
  {
    id: 'effects-time',
    title: 'Эффекты времени (Delay, Reverb)',
    content: `Временные эффекты:

Delay (задержка):
\`\`\`
s("sd").delay(0.5)          // время задержки
s("sd").delay(0.5).delayfeedback(0.5)  // с обратной связью
s("sd").delay(0.25).delaytime(0.125)   // время задержки
\`\`\`

Reverb (реверберация):
\`\`\`
s("sd").room(0.5)           // размер комнаты
s("sd").room(0.8).roomsize(0.9)  // большая комната
s("sd").room(0.5).roomlp(0.5)    // с фильтрацией
\`\`\`

Пример с эффектами:
\`\`\`
note("c4 e4 g4 b4")
  .s("sine")
  .delay(0.25)
  .delayfeedback(0.5)
  .room(0.3)
\`\`\``,
    category: 'effects',
    keywords: ['delay', 'задержка', 'reverb', 'реверберация', 'room', 'эхо', 'пространство'],
  },
  {
    id: 'effects-distortion',
    title: 'Искажение и модуляция',
    content: `Эффекты искажения:

Distortion:
\`\`\`
s("bd sd").distort(0.5)
s("bass").shape(0.7)
\`\`\`

Bitcrusher:
\`\`\`
s("bd sd").crush(4)   // 4-bit звук
s("arpy").coarse(8)   // грубый звук
\`\`\`

Модуляция:

Tremolo (модуляция громкости):
\`\`\`
note("c4").s("sine").tremolo(4)  // 4 Hz
\`\`\`

Phaser:
\`\`\`
s("arpy").phaser(4)
s("pad").phaser(sine.range(2, 8).slow(4))
\`\`\`

Vibrato:
\`\`\`
note("c4").s("sine").vibrato(6)
\`\`\`

Pan (стерео):
\`\`\`
s("hh*8").pan(sine)  // движение влево-вправо
s("bd").pan(0)       // лево
s("sd").pan(1)       // право
\`\`\``,
    category: 'effects',
    keywords: ['distortion', 'искажение', 'crush', 'phaser', 'tremolo', 'pan', 'стерео'],
  },
  {
    id: 'pattern-modifiers',
    title: 'Модификаторы паттернов',
    content: `Модификаторы для изменения паттернов:

Скорость:
\`\`\`
s("bd sd").fast(2)   // в 2 раза быстрее
s("bd sd").slow(2)   // в 2 раза медленнее
\`\`\`

Every (каждые N циклов):
\`\`\`
s("bd sd").every(4, fast(2))   // каждый 4-й цикл быстрее
s("hh*8").every(3, rev)        // каждый 3-й реверс
\`\`\`

Jux (juxtapose - стерео вариация):
\`\`\`
s("arpy").jux(rev)             // реверс в правом канале
s("arpy").jux(fast(2))         // быстрее в правом канале
\`\`\`

Off (смещённая копия):
\`\`\`
note("c4 e4 g4").off(1/8, add(7))  // канон
\`\`\`

Rev (реверс):
\`\`\`
s("bd sd hh cp").rev()
\`\`\`

Degrade (случайное удаление):
\`\`\`
s("hh*16").degrade()           // 50% звуков
s("hh*16").degradeBy(0.3)      // 30% звуков убрать
\`\`\``,
    category: 'functions',
    keywords: ['fast', 'slow', 'every', 'jux', 'rev', 'degrade', 'модификатор', 'скорость'],
  },
  {
    id: 'drum-machines',
    title: 'Драм-машины (банки звуков)',
    content: `Драм-машины подключаются через .bank():

Roland:
\`\`\`
s("bd sd hh").bank("RolandTR808")
s("bd sd hh").bank("RolandTR909")
s("bd sd hh").bank("RolandTR707")
s("bd sd hh").bank("RolandTR606")
\`\`\`

Linn:
\`\`\`
s("bd sd hh").bank("LinnDrum")
s("bd sd hh").bank("LinnLM1")
\`\`\`

Другие:
\`\`\`
s("bd sd hh").bank("OberheimDMX")
s("bd sd hh").bank("EmuDrumulator")
s("bd sd hh").bank("KorgMinipops")
s("bd sd hh").bank("YamahaRX21")
\`\`\`

Выбор вариации звука:
\`\`\`
s("bd*4").bank("RolandTR808").n("0 1 2 3")
\`\`\``,
    category: 'sounds',
    keywords: ['drum machine', 'драм-машина', 'bank', 'банк', '808', '909', 'Roland', 'Linn'],
  },
  {
    id: 'stack-and-layer',
    title: 'Stack и наложение треков',
    content: `Stack используется для наложения нескольких паттернов:

Базовый stack:
\`\`\`
stack(
  s("bd ~ bd ~"),
  s("~ sd ~ sd"),
  s("hh*8").gain(0.6)
)
\`\`\`

С эффектами на весь stack:
\`\`\`
stack(
  s("bd sd"),
  note("c3 e3").s("bass")
).room(0.3)
\`\`\`

Вложенные stack:
\`\`\`
stack(
  stack(
    s("bd ~ bd ~"),
    s("~ cp ~ cp")
  ).bank("RolandTR808"),

  note("c2 e2 g2 e2")
    .s("sawtooth")
    .lpf(400)
)
\`\`\`

Layer (альтернатива stack):
\`\`\`
s("bd sd").layer(
  x => x,
  x => x.fast(2).gain(0.5)
)
\`\`\``,
    category: 'syntax',
    keywords: ['stack', 'layer', 'наложение', 'трек', 'микс', 'слои'],
  },
  {
    id: 'signals',
    title: 'Сигналы и модуляция',
    content: `Непрерывные сигналы для модуляции параметров:

Основные сигналы:
\`\`\`
sine        // синусоида 0-1
cosine      // косинус 0-1
tri         // треугольник 0-1
saw         // пила 0-1
square      // квадрат 0-1
rand        // случайное 0-1
perlin      // шум Перлина
\`\`\`

Изменение диапазона:
\`\`\`
sine.range(200, 2000)   // от 200 до 2000
sine.range(0.5, 1)      // от 0.5 до 1
\`\`\`

Изменение скорости:
\`\`\`
sine.slow(4)    // в 4 раза медленнее
sine.fast(2)    // в 2 раза быстрее
\`\`\`

Примеры использования:
\`\`\`
// Модуляция фильтра
note("c3").s("sawtooth").lpf(sine.range(200, 2000).slow(4))

// Модуляция громкости (tremolo)
s("hh*8").gain(sine.range(0.3, 1).fast(4))

// Модуляция панорамы
s("arpy*4").pan(sine.slow(2))

// Модуляция высоты тона
note("c4").s("sine").add(sine.range(-1, 1).fast(6))
\`\`\``,
    category: 'functions',
    keywords: ['signal', 'сигнал', 'sine', 'модуляция', 'lfo', 'range', 'автоматизация'],
  },
  {
    id: 'cpm-tempo',
    title: 'Темп и скорость',
    content: `Управление темпом:

CPM (cycles per minute):
\`\`\`
cpm(120)    // 120 циклов в минуту = 120 BPM
cpm(140/2)  // 70 циклов = 140 BPM при стандартной структуре
\`\`\`

Соотношение cpm и BPM:
- При 4 ударах на цикл: cpm = BPM
- При 8 ударах на цикл: cpm = BPM/2

Пример с темпом:
\`\`\`
cpm(120);

stack(
  s("bd sd bd sd"),
  s("hh*8")
).bank("RolandTR909")
\`\`\``,
    category: 'syntax',
    keywords: ['cpm', 'bpm', 'темп', 'tempo', 'скорость', 'speed'],
  },
  {
    id: 'samples-n',
    title: 'Выбор вариаций семплов',
    content: `Функция n() для выбора вариаций:

Базовое использование:
\`\`\`
s("bd").n(0)   // первый вариант бочки
s("bd").n(1)   // второй вариант
s("bd").n("0 1 2 3")  // паттерн вариаций
\`\`\`

С драм-машинами:
\`\`\`
s("bd sd hh cp")
  .bank("RolandTR808")
  .n("<0 1> <0 1 2> <0 1 2 3> 0")
\`\`\`

Случайный выбор:
\`\`\`
s("bd*4").n(irand(4))  // случайный 0-3
s("arpy*8").n(irand(8))
\`\`\``,
    category: 'syntax',
    keywords: ['n', 'sample', 'вариация', 'выбор', 'номер', 'irand'],
  },
  {
    id: 'gain-velocity',
    title: 'Громкость',
    content: `Управление громкостью:

Gain (общая громкость):
\`\`\`
s("bd sd").gain(0.5)     // 50% громкости
s("hh*8").gain(0.3)      // тихие хэты
\`\`\`

Velocity (динамика MIDI стиля):
\`\`\`
note("c4 e4 g4").velocity("<1 0.5 0.7 0.3>")
\`\`\`

Accent (акцент):
\`\`\`
s("hh*8").accent("<1 0.5 0.3 0.5>")
\`\`\`

Паттерн громкости:
\`\`\`
s("hh*8").gain("1 0.5 0.7 0.5 1 0.5 0.7 0.5")
\`\`\`

Модуляция громкости:
\`\`\`
s("arpy*4").gain(sine.range(0.3, 1).slow(2))
\`\`\``,
    category: 'effects',
    keywords: ['gain', 'громкость', 'velocity', 'accent', 'volume', 'динамика'],
  },
];

/**
 * Search function for the knowledge base
 * Uses simple keyword matching for fast results
 */
export function searchKnowledge(query: string, maxResults: number = 3): KnowledgeChunk[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  // Score each chunk based on keyword matches
  const scored = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;

    // Title match (highest weight)
    if (chunk.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Keyword matches
    for (const keyword of chunk.keywords) {
      if (keyword.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      for (const word of queryWords) {
        if (keyword.toLowerCase().includes(word)) {
          score += 2;
        }
      }
    }

    // Content matches
    for (const word of queryWords) {
      const matches = (chunk.content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
      score += Math.min(matches, 5); // Cap at 5 matches
    }

    return { chunk, score };
  });

  // Sort by score and return top results
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.chunk);
}

/**
 * Get knowledge by category
 */
export function getKnowledgeByCategory(category: KnowledgeChunk['category']): KnowledgeChunk[] {
  return KNOWLEDGE_BASE.filter(chunk => chunk.category === category);
}

/**
 * Format knowledge chunks for LLM context
 */
export function formatKnowledgeForContext(chunks: KnowledgeChunk[]): string {
  return chunks.map(chunk =>
    `### ${chunk.title}\n${chunk.content}`
  ).join('\n\n---\n\n');
}
