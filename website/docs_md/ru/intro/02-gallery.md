# Галерея треков от сообщества

Лучшие треки и каверы от сообщества Strudel. Эти примеры показывают как создавать красивую, мелодичную музыку с использованием chord progressions, аранжировки, синтезаторов и эффектов.

---

## Почему я? — Nerual Dreming

Полная композиция с секциями (intro, verse, chorus), использует chord progressions, arrange(), stack() для создания многослойной структуры.

```javascript
// @title Почему я?
// @by Nerual Dreming

cpm(130/2);

const progression = chord("<Am F Dm E>");
const heroicArp = n("<4 3 2 1>");

stack(
  // --- 1. ЭФФЕКТЫ ПЕРЕХОДОВ ---
  arrange(
    [15, silence], [1, s("white").gain(saw.fast(2)).lpf(8000).gain(0.5)],
    [15, silence], [1, s("white").gain(saw.fast(2)).lpf(8000).gain(0.5)],
    [15, silence], [1, s("white").gain(saw.fast(2)).lpf(8000).gain(0.5)],
    [7, silence],  [1, s("white").gain(saw.fast(2)).lpf(8000).gain(0.5)],
    [7, silence]
  ).gain(0.05),

  // --- 2. УДАРНЫЕ ---
  arrange(
    [8, s("bd ~ sd ~").lpf(800)], [8, s("bd ~ sd ~")], [8, s("bd sd [bd sd] sd")],
    [8, s("bd ~ sd ~")], [8, s("bd sd [bd sd] sd")], [8, silence],
    [8, s("bd sd bd sd")], [8, s("bd sd [bd sd] sd")], [8, s("bd ~ sd ~").lpf(800).delay(0.5)]
  ).bank("RolandTR909").gain(0.1),
  arrange(
    [8, s("~ ~ sd ~").lpf(800)], [8, s("~ ~ sd ~")], [8, s("~ sd ~ sd")],
    [8, s("~ ~ sd ~")], [8, s("~ sd ~ sd")], [8, silence],
    [8, s("~ sd ~ sd")], [8, s("~ sd ~ sd")], [8, s("~ ~ sd ~").lpf(800).delay(0.5)]
  ).bank("RolandTR909").decay(0.15).lpf(4000).gain(0.1),
  arrange(
    [8, silence], [8, s("hh*8")], [8, s("hh*16")],
    [8, s("hh*8")], [8, s("hh*16")], [8, silence],
    [16, s("hh*16")], [8, silence]
  ).bank("RolandTR909").gain(0.07).lpf(9000),

  // --- 3. БАС-ГИТАРА ---
  arrange(
    [8, silence], [32, n("0").set(progression).voicing()],
    [8, n("<0 ~ 1 ~ 2 ~ 3 ~>").set(progression).voicing()],
    [16, n("0").set(progression).voicing()], [8, silence]
  ).s("sine").lpf(500).gain(0.15),

  // --- 4. РИТМ-ГИТАРА ---
  arrange(
    [8, silence], [8, progression.struct("x ~ [x x] [x x]").adsr("0:0.05:0:0.05")],
    [8, progression.struct("x.long")], [8, progression.struct("x ~ [x x] [x x]").adsr("0:0.05:0:0.05")],
    [8, progression.struct("x.long")],
    [8, silence],
    [16, progression.struct("x.long")], [8, silence]
  ).s("gm_electric_guitar_clean")
   .superimpose(x => x.add(note(0.04)))
   .gain(0.11),

  // --- 5. ЛИД-МЕЛОДИЯ ---
  arrange(
    [8, heroicArp.set(progression).voicing().add(12).s("triangle").room(0.7).delay(0.5)],
    [8, silence], [8, heroicArp.set(progression).voicing().add(12).s("sawtooth").n(8)],
    [8, n("<6 5 4 3>").set(progression).voicing().add(12).s("sawtooth").n(8)],
    [8, heroicArp.set(progression).voicing().add(12).s("sawtooth").n(8)],
    [8, heroicArp.set(progression).voicing().add(12).s("triangle").room(0.7).delay(0.5).release(4)],
    [8, n("~ 4 3 2 <1 0> 1 2").scale("Am:minor").add(note(24)).s("sawtooth").distort("2:0.4").gain(0.8)],
    [8, heroicArp.set(progression).voicing().add(12).s("sawtooth").n(8)],
    [8, heroicArp.set(progression).voicing().add(12).s("triangle").room(0.7).delay(0.5).release(4)]
  ).gain(0.12)

).gain(0.12)
```

**Музыкальные техники:**
- chord() для прогрессии Am-F-Dm-E
- arrange() для структуры секций
- stack() для многослойности (drums + bass + guitar + melody)
- .voicing() для правильного озвучивания аккордов
- .set(progression) для привязки мелодии к аккордам

---

## Love Again — Nerual Dreming

Полная песня с intro/outro, verse, chorus, drop секциями. Использует chord progressions Em-C-Am-D.

```javascript
// @title Love Again
// @by Nerual Dreming

cpm(116/2);
const progression = chord("<Em C Am D>");

const introOutroSection = stack(
    s("bd sd bd sd").gain(0.1),
    s("hh*8").gain(0.09),
    n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).gain(0.12),
    n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)
);

arrange(
  // --- ИНТРО ---
  [4, introOutroSection],

  // --- КУПЛЕТ 1 ---
  [8, stack(
      s("bd ~ sd ~").gain(0.1),
      s("hh*8").gain(0.07),
      progression.rootNotes(2).s("square").lpf(700).gain(0.15),
      n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).ply(2).gain(0.12),
      n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)
    )
  ],
  // --- ПРИПЕВ 1 ---
  [8, stack(
      s("bd sd bd sd").gain(0.1),
      s("hh*8").gain(0.09),
      progression.rootNotes(2).s("square").lpf(700).gain(0.15),
      n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).gain(0.12),
      n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)
    )
  ],
  // --- ДРОП ---
  [8, stack(
      s("bd*4").lpf(1000).room(0.7).gain(0.1),
      progression.rootNotes(1).s("sawtooth").noise(0.4).distort("1:0.2").gain(0.15),
      n("4*4").set(progression).voicing().add(12).s("sawtooth").lpf(400).lpenv(6).lpd(0.1).decay(0.15).sustain(0).gain(0.11),
      n("<0 1 2 3>").set(progression).voicing().rev().s("piano").room(0.12).gain(0.04)
    )
  ],
  // --- ФИНАЛЬНЫЙ ПРИПЕВ ---
  [8, stack(
      s("bd sd bd sd").gain(0.1),
      s("hh*8").gain(0.09),
      progression.rootNotes(2).s("square").lpf(700).gain(0.15),
      n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).gain(0.12),
      n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)
    )
  ],
  // --- АУТРО ---
  [4, introOutroSection]
)
```

**Музыкальные техники:**
- Chord progression: Em-C-Am-D (типичная поп-прогрессия)
- .rootNotes() для басовой линии из корней аккордов
- run(8) для восходящего арпеджио
- .ply(2) для удвоения нот
- Динамическая структура: intro → verse → chorus → drop → chorus → outro

---

## Blue Monday — New Order

Минималистичный электронный трек с басовой линией и драм-паттерном.

```javascript
// "Blue Monday" - New Order
// @by eefano
stack(
  s("bd!2 [bd*4]!2 bd!4").slow(8).bank("SequentialCircuitsDrumtracks"),
  s("~ hh").bank("SequentialCircuitsDrumtracks"),
  n("<[[2 ~] [2 ~] 2 3] [[3 ~] [3 ~] 3 3]>@4 [-1 ~] -1 -1 [0 ~] 0 0 [0 ~] 0 0 [0 ~] 0 0").slow(8).scale("d2:minor").s("gm_lead_8_bass_lead")
).cpm(130)
```

**Музыкальные техники:**
- scale("d2:minor") для минорной тональности
- Повторяющийся басовый паттерн
- slow(8) для замедления структуры

---

## Stranger Things Theme

Synth-based композиция с модуляцией фильтров и detune.

```javascript
// "Stranger Things" Theme
// @by eefano
setcps(0.7)

$: n("0 2 4 6 7 6 4 2")
  .scale("<c3:major>/2")
  .s("supersaw")
  .distort(0.7)
  .superimpose((x) => x.detune("<0.5>"))
  .lpenv(perlin.slow(3).range(1, 4))
  .lpf(perlin.slow(2).range(100, 2000))
  .gain(0.3)

$: "<a1 e2>/8".clip(0.8).struct("x*8").s("supersaw").note()
```

**Музыкальные техники:**
- .superimpose() с detune для толстого звука
- .lpenv() с perlin для органической модуляции фильтра
- Две синт-линии: melody + bass

---

## The Rhythm of the Night — Corona

Dance трек с chord progression, мелодией, басом и drums.

```javascript
// "The Rhythm Of The Night" - Corona
// @by eefano
setDefaultVoicings('legacy')
const crdpart = "Ab Cm Bb F@2".slow(5)
stack(
"<0 1@4 0 1@4>".pick([
  "~@6 [6 ~]!2"
  ,"2 0 ~@4 6 4 6 4 ~@4 [4 3]@3 ~@6 4 7 6 [4@2 ~] [3 2@3]@2 0 ~@2".slow(4)
]).fmap((v) => ({n: v, penv: 0})).scale("c4:minor").s("gm_lead_1_square").room(0.4).delay(0.3).gain(0.7)

,crdpart.chord().anchor("F4").voicing().s("gm_synth_strings_1").gain(0.4)

,"2 ~@2 2 ~@2 2 ~@3 2 ~@3 2 ~"
  .n().scale("c2:minor").note().s("gm_synth_bass_1").lpf(1500).gain(0.7)

,stack(s("bd*4").gain(0.8),s("[~ oh]*4").gain(0.14),s("hh*16").gain(0.09),s("[~ cp]*2").gain(0.4))
  .bank("RolandTR909").room(0.2)

).cpm(128/4)
```

**Музыкальные техники:**
- Chord progression: Ab-Cm-Bb-F
- .anchor() для установки базовой ноты voicing
- .pick() для вариации паттернов
- Multi-layer drums: bd + oh + hh + cp

---

## Waltz No. 2 — Шостакович

Классический вальс с chord progressions и динамическим темпом.

```javascript
// "Waltz #2" - Shostakovich
// @by eefano
setDefaultVoicings('legacy')

$: "<4 [2@2 1] [0@4 0 1]@2 [2 0 2] [4@2 5] 4 3 3 [1@2 0] [0b@4 -3 0b]@2 [1 0b 1] [3 4 5] 4b 4>"
  .scale("c4:minor").note().s("gm_oboe:2").gain(0.6)

$: n("<<0 -1> [4,5]!2>*3")
  .chord("<Cm@10 Fm@4 G@4 Cm@4 Fm@2 Bb@2 Eb Ab>")
  .anchor('f2').mode('root').voicing().piano().room(0.6)

all(x=>x.cps(sine.segment(32).slow(16).mul(30).add(160).div(60*3)))
```

**Музыкальные техники:**
- Chord progression: Cm-Fm-G-Cm-Fm-Bb-Eb-Ab
- all(x => x.cps(...)) для динамического изменения темпа
- sine.segment() для плавной модуляции tempo
- .mode('root') для bass notes

---

## Pyramid Song — Radiohead

Сложный ритмический паттерн с piano voicings.

```javascript
// "Pyramid Song" - Radiohead
// @by eefano
setcps(104/60/4)

let chr = {X:"f#2,c#3,a#3,c#4,f#4", Y:"g2,d3,b3,d4,f#4", Z:"a2,e3,a3,c#4,f#4", J:"g2,d3,b3,d4,g4", K:"f#2,c#3,a#3,c#4,g4",
           V:"f#2,c#3,a3,c#4,f#4", W:"e2,b2,g#3,b3,f#4"}

$: "<[X:.6 X:.8]@3 Y:.5@2 [Z:.5 Z:.5]@3 [Z:.4 Y:.4]@3 Y:.3@2 [J:.6 J:.9]@3>/2"
  .pickOut(chr).note().piano().gain(0.8).room(.6)

$: "<[bd,rd] ~ [~ sf*3] [bd,rd] ~ [~ sf*3] [bd,rd] ~ ~ [~ sf*3]>*4".pickOut({
  bd: s('bd').bank('Linn9000').lpf(1000),
  sd: s('sd').bank('RolandMT32').velocity(.5),
  sf: s('sd').bank('RolandMT32').velocity(.2),
  rd: s('rd').bank('Linn9000').velocity(0.3).hpf(8000),
}).room(.2).gain(0.5)
```

**Музыкальные техники:**
- Custom chord voicings (словарь chr)
- .pickOut() для выбора из словаря
- Нестандартный ритм (не 4/4)
- Layered drums с разными velocity

---

## Amelie Waltz

Романтический вальс с аккордами и мелодией.

```javascript
// Amelie Waltz
// @by eefano
setDefaultVoicings('legacy')
stack(
  n("[0@2 ~, ~ [[1,2,3] ~]!2]")
  .chord("<[Dm Am]!2 [F C]!2>/4")
  .anchor("<[B3 G3]!2 [C4 B3]!2>/4")
  .voicing().velocity(0.5)
  ,
  n("<[3@5.5 2@0.5 1@3 0@3] [3@3.5 [4 3 2 1 2]@2.5 1@3 0@3] [2@5.5 1@0.5 -3@6]!2>/4")
  .scale("a4:minor")

).s("gm_harmonica").lpf(4000).clip(1)
  .attack(0.1).release(0.1)
  .room(1.5)
  .cpm(64).gain(.6)
```

**Музыкальные техники:**
- Chord progression: Dm-Am-F-C
- Вальсовый ритм (3/4)
- scale("a4:minor") для минорной мелодии
- .anchor() меняется вместе с аккордами

---

## Happy Birthday

Классическая мелодия с аккордовым аккомпанементом.

```javascript
// Happy Birthday
// @by eefano
setDefaultVoicings('legacy')

const chrds = "F@3 C@6 F@6 Bb@3 F@2 C F@3".slow(8);

stack(
"[C4@3 C4] D4 C4 F4 E4@2 [C4@3 C4] D4 C4 G4 F4@2 [C4@3 C4] C5 A4 F4 E4 D4 [Bb4@3 Bb4] A4 F4 G4 F4@2".slow(8).early(1/3).note().s("gm_harmonica").gain(0.4),
chord(chrds).anchor("G4").struct("x*3").voicing().piano().gain(0.2),
n("2 ~ ~ 2 1 ~").chord(chrds).anchor(chrds.rootNotes(2)).voicing().s("gm_electric_bass_finger").lpf(190).gain(1),

s("hh*3, <bd ~>, ~ ~ rim").bank("KorgDDM110").gain(0.2)

).cpm(120/4).room(0.3)
```

**Музыкальные техники:**
- Chord progression: F-C-F-Bb-F-C-F
- .early(1/3) для синкопации мелодии
- chord().struct("x*3") для вальсового ритма
- Bass follows chord roots

---

## Shanghai — King Gizzard

Прогрессивный рок с модуляцией тональности.

```javascript
// "Shanghai" - King Gizzard
// @by eefano
setcps(81 / 60)

$: n("<0 1 2 ~ 4 5 5 ~ 4 2 1 5 8 7 9!2 7 8 5 1 2 4 ~ 5!2 4 ~ 2 1 0 -7!8>*4").scale('ab4:major').clip(.5).s("triangle").room(.8)

$: n("<[0,2,4]!4>".add("<0 1 0 1 -2 0>/8")).scale("<ab3:major@5 bb3:major@1>/8").piano().gain(.5)

$: n("<0@7 -4 0@6 0@4 -4 0@9 3@2 4@2>*4".add("<0 1 0 1 5 1>/8")).scale('ab1:major').clip(.95).s("gm_electric_bass_finger").lpf(800)

$: s("<hh*4>").bank('RolandTR909').speed(1.5).gain(.2)
$: s("<[bd@3 <~ bd>] ~>").bank('RolandTR909').gain(.7)
$: s("<~ sd>").bank('RolandTR909').gain(.7)
```

**Музыкальные техники:**
- Модуляция: ab3:major → bb3:major
- Сложная мелодическая линия
- .add() для транспозиции по паттерну
- Multi-track drums

---

## Ресурсы сообщества

### Прямые ссылки на треки
| Трек | Автор | Ссылка |
|------|-------|--------|
| Grimes – Music 4 Machines | KAIXI | [открыть](https://strudel.cc/?sOc7cVTqJHUU) |
| Charli XCX – 360 | KAIXI | [открыть](https://strudel.cc/?2ErYTSUotoaQ) |
| Radiohead – Pyramid Song | eefano | [открыть](https://strudel.cc/?MeMCjUtlCAoK) |
| Billie Eilish – Birds of a Feather | saga_3k | [открыть](https://strudel.cc/?yTnr825wyd9V) |
| Shostakovich – Waltz No.2 | eefano | [открыть](https://strudel.cc/?o2VwC4Jq66XI) |

### Коллекции
- [eefano/strudel-songs-collection](https://github.com/eefano/strudel-songs-collection) — 75+ каверов
- [awesome-strudel](https://github.com/terryds/awesome-strudel) — курируемая коллекция

---

## 🎵 Ключевые паттерны создания красивой музыки

### 1. Chord Progressions (Прогрессии аккордов)
```javascript
// Популярные прогрессии:
const prog1 = chord("<Em C Am D>");        // I-VI-IV-V (эмоциональная)
const prog2 = chord("<C G Am F>");         // I-V-VI-IV (поп-музыка)
const prog3 = chord("<Am F Dm E>");        // VI-IV-II-V (минорная)
const prog4 = chord("<Ab Cm Bb F@2>");     // Для танцевальной музыки
```

### 2. Melody + Chords (Мелодия + Аккорды)
```javascript
const progression = chord("<C G Am F>");

// Мелодия следует за аккордами:
n("<4 2 5 3>")
  .set(progression)  // Привязка к прогрессии
  .voicing()         // Правильное озвучивание
  .add(12)           // Октава выше
  .s("piano")
```

### 3. Bass Following Roots (Бас по корням аккордов)
```javascript
const progression = chord("<Em C Am D>");

// Бас из корневых нот:
progression.rootNotes(2)  // Октава 2
  .s("sawtooth")
  .lpf(400)
  .gain(0.15)
```

### 4. Layering (Многослойность)
```javascript
stack(
  s("bd ~ sd ~"),                    // Drums
  progression.rootNotes(2).s("sine"), // Bass
  progression.voicing().s("piano"),   // Chords
  n("4 2 5 3").set(progression)       // Melody
    .voicing().add(12).s("triangle")
)
```

### 5. Song Structure (Структура песни)
```javascript
const intro = s("bd sd").room(0.5);
const verse = stack(drums, bass);
const chorus = stack(drums, bass, melody);

arrange([
  [4, intro],    // 4 цикла intro
  [8, verse],    // 8 циклов verse
  [8, chorus],   // 8 циклов chorus
  [8, verse],
  [8, chorus],
  [4, intro]     // outro
]);
```

### 6. Voicings (Озвучивание аккордов)
```javascript
// Разные режимы voicing:
chord("<C G Am F>")
  .anchor("E4")      // Базовая нота
  .voicing()         // Автоматическое озвучивание
  .s("piano")

// Или вручную:
chord("<C G Am F>")
  .mode('root')      // Только корни
  .voicing()
```

### 7. Scales для мелодий
```javascript
// Минорная мелодия:
n("0 2 4 5 7 5 4 2")
  .scale("c4:minor")
  .s("sine")

// Мажорная:
n("0 2 4 6 7 6 4 2")
  .scale("c3:major")
  .s("triangle")

// Экзотические:
n("0 1 2 3 4 5 6 7")
  .scale("c:phrygian")  // Или lydian, dorian, etc
```

### 8. Arpeggios (Арпеджио)
```javascript
const progression = chord("<Am F C G>");

// Восходящее арпеджио:
n(run(8))
  .set(progression)
  .voicing()
  .add(24)
  .s("sine")

// Или вручную:
n("<0 2 4 6>")
  .set(progression)
  .voicing()
```

---

**Используй searchDocs('gallery') или searchDocs('examples') чтобы найти эти примеры!**
