# Галерея треков от сообщества

Лучшие треки и каверы от сообщества Strudel. Нажмите play!

---

## Почему я? — Nerual Dreming

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

---

## Love Again — Nerual Dreming

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

---

## Blue Monday — New Order

```javascript
// "Blue Monday" - New Order
// @by eefano
stack(
  s("bd!2 [bd*4]!2 bd!4").slow(8).bank("SequentialCircuitsDrumtracks"),
  s("~ hh").bank("SequentialCircuitsDrumtracks"),
  n("<[[2 ~] [2 ~] 2 3] [[3 ~] [3 ~] 3 3]>@4 [-1 ~] -1 -1 [0 ~] 0 0 [0 ~] 0 0 [0 ~] 0 0").slow(8).scale("d2:minor").s("gm_lead_8_bass_lead")
).cpm(130)
```

---

## Stranger Things Theme

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

> Примечание: В оригинальной версии представлено гораздо больше треков с интерактивными примерами кода.
> Полную галерею можно посмотреть на официальном сайте Strudel.
