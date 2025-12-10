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
    id: 'sparkway-drum-kit',
    title: 'Sparkway Drum Kit',
    content: `Sparkway Drum Kit - набор современных драм-семплов от @wonderluverz (168 семплов).

Идеально подходит для: UK Garage, Future Garage, Drum'n'Bass, Trap, Hip-Hop, Lo-Fi, современная электронная музыка.

Банки:
- \`spk_808\` - 808 басы (12 семплов): drake, goyard, joker, monin, shloppy, soiuzers, spining, stomp, yuppi, moodf1x, shewantsdruzio, yonky
- \`spk_reese\` - Reese/Moog басы (6 семплов): friendly, gin, kino, mqa, papers, reason
- \`spk_kick\` - Кики (13 семплов): bomb, burial, calvin, crysis, doodlejump, duduk, groove, hatelove, indigo, mbwtcs, maximum, pooma, when
- \`spk_snare\` - Снейры (14 семплов): cobalt, flamyway, glaremade, king, lifestyle, mbwtcs, millenium, neurons, polosa, stability, starwood, streli, uk, windy
- \`spk_clap\` - Хлопки (8 семплов): bb, bars, druzio, glorage, imba, snow, sparkway, tap
- \`spk_hat\` - Хай-хэты (14 семплов): 88, candy, hard, jam, mb, perfect, potentia, setting, shake, trick, vroom, wv, winner, xxx
- \`spk_oh\` - Открытые хэты (3 семпла): fg, mbwtcs, strong
- \`spk_crash\` - Крэши (8 семплов): bestie, blow, blur, cup, dora, dream, ego, orchid
- \`spk_perc\` - Перкуссия (23 семпла): 4life, bell, chichime, cyber, die, friendly, glaremade, galaxy, hoverboard, luche, mbwtcs, mind, mission, mucha, no-aarne, opdf, obed, orbit, remove, rodnoy, soiuz-money, sparkway, technology
- \`spk_drumloop\` - Драм лупы (40 семплов, 104-150 BPM)
- \`spk_percloop\` - Перкуссионные лупы (8 семплов)
- \`spk_shot\` - One-shot семплы (5 семплов)
- \`spk_vocal\` - Вокальные лупы (14 семплов, разные тональности)

Примеры использования:
\`\`\`
// Простой бит
s("spk_kick spk_snare spk_hat*2 spk_clap")

// 808 бас с нотами
s("spk_808:0").note("c2 e2 g2 c3")

// Drum loop с подгонкой
s("spk_drumloop:5").fit().loopAt(4)

// Комбинация с эффектами
stack(
  s("spk_kick ~ spk_kick ~"),
  s("~ spk_snare:3 ~ spk_snare:3"),
  s("spk_hat*8").gain(0.6)
).room(0.2)
\`\`\``,
    category: 'sounds',
    keywords: ['sparkway', 'spk', '808', 'kick', 'snare', 'clap', 'hat', 'perc', 'drumloop', 'vocal', 'reese', 'moog', 'wonderluverz', 'drum kit', 'uk garage', 'future garage', 'drum and bass', 'dnb', 'trap', 'hip-hop', 'lo-fi', 'electronic', 'современный', 'электронная музыка'],
  },
  {
    id: 'e-pianos',
    title: 'E-Pianos (электропиано)',
    content: `E-Pianos - набор классических электропиано 70-80х годов (50 семплов, 3.2 MB).

Идеально подходит для: Jazz, Soul, Funk, R&B, Neo-Soul, Lo-Fi Hip-Hop, Chill, мягкие аккомпанементы.

Банки:
- \`cp80\` - Yamaha CP80 электрогранд (22 семпла) - яркий, богатый звук, знаменит по записям 70-80х
- \`wurlitzer\` - Wurlitzer 200A (11 семплов) - тёплый, немного грязный винтажный звук, классика фанка
- \`pianet\` - Hohner Pianet T (17 семплов) - нежный, колокольчатый звук, мягче Wurlitzer

Особенности:
- Записаны в высоком качестве (CC-BY Greg Sullivan)
- Только FF (forte) velocity для чистого, яркого звука
- Охватывают полный диапазон клавиатуры

Примеры использования:
\`\`\`
// Мягкие аккорды на CP80
note("c4 e4 g4 b4").s("cp80").room(0.3)

// Funk riff на Wurlitzer
note("[c3 eb3]*2 [f3 ab3]*2")
  .s("wurlitzer")
  .lpf(1500)
  .gain(0.7)

// Нежная мелодия на Pianet
note("g4 a4 b4 d5 e5")
  .s("pianet")
  .delay(0.25)
  .room(0.4)

// Аккорды с ритмом
note("<[c4,e4,g4] [f4,a4,c5] [g4,b4,d5] [e4,g4,b4]>")
  .s("cp80")
  .attack(0.01)
  .release(0.5)
\`\`\``,
    category: 'sounds',
    keywords: ['e-piano', 'epiano', 'электропиано', 'cp80', 'wurlitzer', 'pianet', 'rhodes', 'piano', 'пианино', 'jazz', 'soul', 'funk', 'neo-soul', 'lofi', 'lo-fi', 'chill', 'vintage', 'винтаж', '70s', '80s', 'мягкий', 'тёплый'],
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

  // CRITICAL WARNING for agent
  {
    id: 'critical-tools-usage',
    title: '🚨 КРИТИЧЕСКОЕ ПРАВИЛО: Использование тулов',
    content: `НИКОГДА не придумывай названия звуков из головы!

ОБЯЗАТЕЛЬНО:
- ПЕРЕД s("название") → вызови getAvailablePacks()
- ПЕРЕД .bank("pack:N") → вызови getBankSamples("pack")
- Если пользователь говорит "не работает" → проверь через getAvailablePacks()
- Если не уверен → searchDocs('samples') или getAvailablePacks()

Используй ТОЛЬКО существующие звуки из ответа тула!`,
    category: 'general',
    keywords: ['samples', 'банки', 'banks', 'packs', 'tools', 'getAvailablePacks', 'getBankSamples', 'ошибка', 'error'],
  },

  // Wavetable Synthesis
  {
    id: 'wavetable-synthesis',
    title: 'Wavetable синтез',
    content: `Wavetable synthesis - синтез на основе wavetable осцилляторов.

Позиция в wavetable:
\`\`\`
note("c3").s("bass")
  .wt(0.3)              // позиция в wavetable (0-1)
  .wtenv(0.5)           // envelope amount
  .wtattack(0.01)       // attack
  .wtdecay(0.2)         // decay
  .wtsustain(0.7)       // sustain
  .wtrelease(0.5)       // release
\`\`\`

LFO модуляция wavetable:
\`\`\`
note("c3").s("bass")
  .wt(0.5)
  .wtrate(4)            // частота LFO (Hz)
  .wtdepth(0.3)         // глубина модуляции
  .wtshape("sine")      // форма LFO
\`\`\`

Warp (деформация wavetable):
\`\`\`
note("c3").s("bass")
  .warp(0.5)            // деформация (0-1)
  .warpmode(2)          // режим деформации
  .warpattack(0.01)
  .warpdecay(0.2)
  .warpsustain(0.5)
  .warprelease(0.3)
\`\`\`

Комбинация:
\`\`\`
note("c3 e3 g3").s("bass")
  .wt(sine.range(0.2, 0.8).slow(4))
  .warp(0.3)
  .lpf(1000)
\`\`\``,
    category: 'sounds',
    keywords: ['wavetable', 'wt', 'warp', 'oscillator', 'синтез', 'wtenv', 'wtattack', 'wtrate', 'wtdepth'],
  },

  // FM Synthesis
  {
    id: 'fm-synthesis',
    title: 'FM синтез',
    content: `FM (Frequency Modulation) synthesis - 8 операторов.

Базовый FM:
\`\`\`
note("c3").s("sine")
  .fm(2, 3)             // гармоника 2, индекс 3
\`\`\`

Отдельные операторы (fm1-fm8):
\`\`\`
note("c3").s("sine")
  .fm1(1, 2)            // оператор 1
  .fm2(2, 1.5)          // оператор 2
  .fm3(3, 0.5)          // оператор 3
\`\`\`

Управление FM:
\`\`\`
note("c3").s("sine")
  .fmh(2)               // гармоника (harmonic)
  .fmi(3)               // индекс модуляции
  .fmenv(5)             // envelope amount
  .fmattack(0.01)
  .fmdecay(0.2)
  .fmsustain(0.5)
  .fmrelease(0.3)
\`\`\`

Сложный FM тембр:
\`\`\`
note("c2 e2 g2").s("sine")
  .fm1(1, 4)
  .fm2(2, 2)
  .fm3(3, 1)
  .fmenv(8)
  .lpf(2000)
\`\`\``,
    category: 'sounds',
    keywords: ['fm', 'fm synthesis', 'frequency modulation', 'fmh', 'fmi', 'fmenv', 'operator', 'оператор'],
  },

  // Advanced Pattern Functions
  {
    id: 'advanced-patterns',
    title: 'Продвинутые функции паттернов',
    content: `Продвинутые модификаторы паттернов:

Euclidean rhythms:
\`\`\`
s("bd").euclidLegacy(3, 8)        // 3 удара на 8 шагов
s("sd").euclidLegacy(5, 16, 2)    // со смещением 2
\`\`\`

Iter (вращение паттерна):
\`\`\`
s("bd sd hh cp").iter(4)          // вращение каждый цикл
\`\`\`

Chop (нарезка семпла):
\`\`\`
s("amen").chop(8)                 // нарезать на 8 частей
s("amen").chop(16).rev()          // реверс нарезки
\`\`\`

Slice (выбор кусочков):
\`\`\`
s("amen").slice(8, "0 1 2 3")     // выбрать кусочки
\`\`\`

Striate (гранулярный):
\`\`\`
s("pad").striate(8)               // гранулярная нарезка
\`\`\`

Segment (деление на сегменты):
\`\`\`
note("c4 e4 g4").segment(8)       // разбить на 8 событий
\`\`\`

Shuffle (перемешать):
\`\`\`
s("bd sd hh cp").shuffle(4)       // случайный порядок
\`\`\`

Palindrome (туда-обратно):
\`\`\`
s("bd sd hh cp").palindrome()     // bd sd hh cp hh sd
\`\`\``,
    category: 'functions',
    keywords: ['euclidean', 'iter', 'chop', 'slice', 'striate', 'segment', 'shuffle', 'palindrome', 'продвинутые'],
  },

  // Time Modifiers
  {
    id: 'time-modifiers',
    title: 'Модификаторы времени',
    content: `Продвинутые функции работы со временем:

Early/Late (смещение):
\`\`\`
s("bd sd").early(0.1)             // раньше на 0.1 цикла
s("hh*8").late(0.05)              // позже на 0.05
\`\`\`

Hurry (ускорение с pitch):
\`\`\`
s("bd sd hh cp").hurry(2)         // быстрее + выше
s("arpy*4").hurry(0.5)            // медленнее + ниже
\`\`\`

Compress (сжатие в часть цикла):
\`\`\`
s("bd sd hh cp").compress(0, 0.5) // в первую половину
s("arpy*4").compress(0.5, 1)      // во вторую половину
\`\`\`

Inside (выполнить в части цикла):
\`\`\`
s("bd sd").inside(2, rev)         // реверс в каждой половине
\`\`\`

Outside (выполнить на N циклах):
\`\`\`
s("bd sd").outside(4, fast(2))    // fast каждые 4 цикла
\`\`\`

Linger (задержка):
\`\`\`
s("bd sd hh cp").linger(0.25)     // каждый звук длится дольше
\`\`\`

Swing:
\`\`\`
s("hh*8").swingBy(0.1)            // свинг
\`\`\``,
    category: 'functions',
    keywords: ['early', 'late', 'hurry', 'compress', 'inside', 'outside', 'linger', 'swing', 'время', 'time'],
  },

  // Filter Envelopes
  {
    id: 'filter-envelopes',
    title: 'Фильтровые огибающие',
    content: `Детальное управление фильтрами через ADSR огибающие:

LP Filter Envelope:
\`\`\`
note("c2").s("sawtooth")
  .lpf(100)               // стартовая частота
  .lpenv(6)               // глубина огибающей (октавы)
  .lpattack(0.01)         // атака фильтра
  .lpdecay(0.2)           // затухание
  .lpsustain(0.3)         // уровень sustain
  .lprelease(0.5)         // релиз
\`\`\`

HP Filter Envelope:
\`\`\`
s("noise")
  .hpf(2000)
  .hpenv(3)
  .hpattack(0.1)
  .hpdecay(0.3)
  .hpsustain(0.5)
  .hprelease(0.4)
\`\`\`

BP Filter Envelope:
\`\`\`
s("white")
  .bpf(1000)
  .bpenv(4)
  .bpattack(0.01)
  .bpdecay(0.2)
  .bpsustain(0.6)
  .bprelease(0.3)
\`\`\`

Filter LFO:
\`\`\`
note("c3").s("sawtooth")
  .lpf(500)
  .lprate(4)              // частота LFO (Hz)
  .lpdepth(0.5)           // глубина модуляции
  .lpshape("sine")        // форма LFO
  .lpdc(0.5)              // DC offset
\`\`\``,
    category: 'effects',
    keywords: ['lpenv', 'hpenv', 'bpenv', 'filter envelope', 'огибающая', 'lpattack', 'lpdecay', 'lprate', 'lpdepth'],
  },

  // Arrangement
  {
    id: 'arrangement',
    title: 'Аранжировка треков',
    content: `Создание полной композиции с секциями:

Базовый arrange:
\`\`\`
const intro = s("bd sd").room(0.5);
const verse = stack(
  s("bd ~ bd ~"),
  s("~ sd ~ sd"),
  s("hh*8")
);
const chorus = verse.fast(2).room(0.3);

arrange([
  [4, intro],             // 4 цикла intro
  [8, verse],             // 8 циклов verse
  [8, chorus],            // 8 циклов chorus
  [4, intro]              // 4 цикла outro
]);
\`\`\`

С прогрессией:
\`\`\`
cpm(120/2);

const progression = chord("<Em C Am D>");

const drums = stack(
  s("bd sd bd sd"),
  s("hh*8").gain(0.6)
);

const bass = progression
  .rootNotes(2)
  .s("sawtooth")
  .lpf(400);

const melody = n("<4 2 5 3>")
  .set(progression)
  .voicing()
  .add(12)
  .s("piano");

const intro = drums;
const verse = stack(drums, bass);
const chorus = stack(drums, bass, melody);

arrange([
  [4, intro],
  [8, verse],
  [8, chorus],
  [8, verse],
  [8, chorus],
  [4, intro]
]);
\`\`\``,
    category: 'examples',
    keywords: ['arrange', 'arrangement', 'аранжировка', 'structure', 'структура', 'song', 'композиция'],
  },

  // Music Theory: Chord Progressions
  {
    id: 'chord-progressions',
    title: 'Прогрессии аккордов (Chord Progressions)',
    content: `Chord progressions - последовательности аккордов, создающие гармоническую основу композиции.

Популярные прогрессии:
\`\`\`
// I-V-VI-IV (поп-музыка)
const prog1 = chord("<C G Am F>");

// I-VI-IV-V (эмоциональная)
const prog2 = chord("<Em C Am D>");

// VI-IV-II-V (минорная)
const prog3 = chord("<Am F Dm E>");

// Для танцевальной музыки
const prog4 = chord("<Ab Cm Bb F@2>");

// Jazz (ii-V-I)
const jazz = chord("<Dm7 G7 C^7>");
\`\`\`

Как использовать прогрессии:
\`\`\`
const progression = chord("<C G Am F>");

// Бас из корневых нот:
progression.rootNotes(2).s("sine").lpf(400)

// Аккорды с voicing:
progression.voicing().s("piano")

// Мелодия следует за аккордами:
n("<4 2 5 3>").set(progression).voicing().add(12)
\`\`\`

Модуляция (смена тональности):
\`\`\`
// Переход C major → G major
chord("<C F G@2 | G C D@2>")

// Или через .transpose():
chord("<C G Am F>").transpose("<0 | 5>")
\`\`\``,
    category: 'theory',
    keywords: ['chord progression', 'прогрессия', 'аккорды', 'harmony', 'гармония', 'модуляция', 'тональность'],
  },

  // Melody Writing
  {
    id: 'melody-writing',
    title: 'Создание мелодий',
    content: `Как создавать красивые, запоминающиеся мелодии:

1. Мелодия следует за аккордами:
\`\`\`
const progression = chord("<C G Am F>");

// Мелодия из степеней аккордов:
n("<0 2 4 2>")              // 1, 3, 5, 3 ступени
  .set(progression)         // Привязка к прогрессии
  .voicing()               // Правильные ноты
  .add(12)                 // Октава выше
  .s("piano")
\`\`\`

2. Использование scale():
\`\`\`
// Минорная мелодия:
n("0 2 3 5 7 5 3 2")
  .scale("c4:minor")
  .s("triangle")

// Мажорная:
n("0 2 4 5 7 9 11 12")
  .scale("c3:major")
  .s("sine")
\`\`\`

3. Арпеджио (разложенные аккорды):
\`\`\`
const progression = chord("<Am F C G>");

// Восходящее арпеджио:
n(run(8))                   // 0 1 2 3 4 5 6 7
  .set(progression)
  .voicing()
  .s("sine")

// Или вручную:
n("<0 2 4 6>")
  .set(progression)
  .voicing()
\`\`\`

4. Мотив и вариации:
\`\`\`
// Основной мотив:
const motif = n("0 2 4 2");

// Вариация 1 - транспозиция:
motif.add(2)                // На тон выше

// Вариация 2 - реверс:
motif.rev()

// Вариация 3 - удлинение:
motif.slow(2)
\`\`\`

5. Контурные мелодии:
\`\`\`
// Восходящая:
n("0 1 2 3 4 5 6 7")

// Нисходящая:
n("7 6 5 4 3 2 1 0")

// Волнообразная:
n("0 2 4 6 4 2 0 -2")
\`\`\`

6. Ритмическая вариация:
\`\`\`
// Синкопы:
n("c4 ~ e4 ~ g4 ~ e4 ~")

// Триоли:
n("c4 e4 g4").fast(3/2)

// Пунктирный ритм:
n("[c4@3 e4] [g4@3 e4]")
\`\`\``,
    category: 'theory',
    keywords: ['melody', 'мелодия', 'composition', 'композиция', 'writing', 'создание', 'arpeggio', 'арпеджио', 'мотив'],
  },

  // Voicings
  {
    id: 'voicings-theory',
    title: 'Voicings - Озвучивание аккордов',
    content: `Voicing - способ расположения нот в аккорде.

Основные функции:
\`\`\`
// Автоматическое voicing:
chord("<C G Am F>")
  .voicing()                // Умное расположение нот
  .s("piano")

// С anchor (базовая нота):
chord("<C G Am F>")
  .anchor("E4")             // Вокруг E4
  .voicing()

// Режимы:
chord("<C G Am F>")
  .mode('root')             // Только корни
  .voicing()

chord("<C G Am F>")
  .mode('below')            // Ноты ниже anchor
  .voicing()
\`\`\`

Voicing для разных инструментов:
\`\`\`
const progression = chord("<C G Am F>");

// Piano (широкое расположение):
progression
  .anchor("C4")
  .voicing()
  .s("piano")

// Strings (плотное):
progression
  .anchor("G3")
  .voicing()
  .s("gm_string_ensemble_1")

// Bass (только корни):
progression
  .rootNotes(2)             // C2, G2, A2, F2
  .s("sawtooth")
  .lpf(400)
\`\`\`

Drop voicings (джазовые):
\`\`\`
// Drop-2 voicing вручную:
chord("C^7")                // C E G B
  .layer(
    x => x.mode('root').voicing(),
    x => x.mode('above').voicing().add(12)
  )
\`\`\`

Leadsheet voicings:
\`\`\`
// Preset voicings:
chord("<C^7 A7b13 Dm7 G7>")
  .dict('ireal')            // iReal Pro стиль
  .voicing()
  .s("piano")
\`\`\``,
    category: 'theory',
    keywords: ['voicing', 'voicings', 'озвучивание', 'аккорды', 'anchor', 'mode', 'расположение', 'drop'],
  },

  // Scales and Modes
  {
    id: 'scales-modes',
    title: 'Гаммы и лады (Scales & Modes)',
    content: `Scales - наборы нот, создающие тональность.

Основные гаммы:
\`\`\`
// Major (мажор):
n("0 2 4 5 7 9 11 12")
  .scale("c4:major")

// Minor (минор):
n("0 2 3 5 7 8 10 12")
  .scale("a3:minor")

// Harmonic minor:
n("0 2 3 5 7 8 11 12")
  .scale("a3:harmonic minor")

// Melodic minor:
n("0 2 3 5 7 9 11 12")
  .scale("a3:melodic minor")
\`\`\`

Лады (Modes):
\`\`\`
// Ionian (мажор):
n("0 2 4 5 7 9 11").scale("c:ionian")

// Dorian (джазовый минор):
n("0 2 3 5 7 9 10").scale("d:dorian")

// Phrygian (испанский):
n("0 1 3 5 7 8 10").scale("e:phrygian")

// Lydian (мечтательный):
n("0 2 4 6 7 9 11").scale("f:lydian")

// Mixolydian (блюзовый мажор):
n("0 2 4 5 7 9 10").scale("g:mixolydian")

// Aeolian (натуральный минор):
n("0 2 3 5 7 8 10").scale("a:aeolian")

// Locrian (уменьшенный):
n("0 1 3 5 6 8 10").scale("b:locrian")
\`\`\`

Пентатоника:
\`\`\`
// Major pentatonic:
n("0 2 4 7 9")
  .scale("c4:major pentatonic")

// Minor pentatonic:
n("0 3 5 7 10")
  .scale("a3:minor pentatonic")
\`\`\`

Экзотические:
\`\`\`
// Whole tone:
n("0 2 4 6 8 10").scale("c:whole")

// Diminished:
n("0 2 3 5 6 8 9 11").scale("c:diminished")

// Blues:
n("0 3 5 6 7 10").scale("c:blues")
\`\`\`

Транспозиция в гамме:
\`\`\`
// scaleTranspose - транспозиция по ступеням:
n("0 2 4 6")
  .scale("c:major")
  .scaleTranspose("<0 2 4>")    // Транспозиция на 0, 2, 4 ступени
\`\`\``,
    category: 'theory',
    keywords: ['scale', 'scales', 'гамма', 'гаммы', 'mode', 'modes', 'лад', 'лады', 'pentatonic', 'пентатоника'],
  },

  // Musical Examples Reference
  {
    id: 'gallery-examples',
    title: 'Примеры из галереи',
    content: `В галерее есть 10+ полных примеров композиций.

Как получить доступ:
\`\`\`
searchDocs('gallery')
searchDocs('examples')
searchDocs('chord progression examples')
\`\`\`

Примеры включают:
- "Почему я?" - полная композиция с arrange(), chord progressions Am-F-Dm-E
- "Love Again" - структура intro/verse/chorus/drop с Em-C-Am-D
- "Blue Monday" - минималистичный электронный трек
- "The Rhythm of the Night" - dance трек с Ab-Cm-Bb-F
- "Waltz No. 2" - классический вальс с chord progressions
- "Pyramid Song" - сложные piano voicings
- "Happy Birthday" - мелодия с аккордовым аккомпанементом
- "Shanghai" - прогрессивный рок с модуляцией

Каждый пример показывает:
- Использование chord progressions
- Layering (многослойность)
- Arrangement (структура секций)
- Voicings (озвучивание аккордов)
- Melody + Chords взаимодействие

Изучай эти примеры для вдохновения!`,
    category: 'examples',
    keywords: ['gallery', 'галерея', 'examples', 'примеры', 'inspiration', 'вдохновение', 'композиция', 'composition'],
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
