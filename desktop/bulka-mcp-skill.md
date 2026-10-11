---
name: bulka-live-coding
description: Писать, менять, запускать и останавливать музыку в приложении Bulka (форк Strudel, live-coding) через MCP-сервер. Используй ВСЕГДА, когда пользователь просит создать/изменить/сыграть/остановить музыку, бит, мелодию, трек, паттерн, аранжировку, лупу или звук в Bulka — на десктопе или в браузере. Умеет писать полноценные треки на Strudel, добавлять партии, отлаживать по консоли, искать в документации (RAG), брать примеры по жанру и список звуков, а также визуализацию. Тулзы: setCodeAndPlay, setFullCode, appendCode, editCode, readCode, playMusic, stopMusic, highlightCode, searchDocs, getExamples, getAvailablePacks, getBankSamples, getConsole, getNewMessages, sendChatMessage.
---

# Bulka — live-coding музыки через MCP

Bulka (форк Strudel) — редактор музыки кодом. Через MCP-сервер ты пишешь и запускаешь музыку в
реальном приложении пользователя: он слышит результат мгновенно и видит осциллоскоп/визуал.

## Подключение
Десктопная Bulka держит MCP на `http://127.0.0.1:4188/mcp`, пока приложение открыто. Запускать
ничего не надо. Конфиг (`claude_desktop_config.json` / Cursor):
```json
{ "mcpServers": { "bulka": { "type": "streamable-http", "url": "http://127.0.0.1:4188/mcp" } } }
```
Или в Claude Code: `claude mcp add --transport http bulka http://127.0.0.1:4188/mcp`.
Bulka должна быть открыта, иначе тулзы редактора вернут «окно не подключено».

## Инструменты (ровно те же, что у встроенного агента Bulka)
Редактор и воспроизведение:
- `setCodeAndPlay(code)` — заменить ВЕСЬ код и сразу запустить (главный инструмент).
- `setFullCode(code)` — заменить код без запуска; `playMusic()` / `stopMusic()` — старт/стоп.
- `appendCode(code)` — дописать партию; `editCode(search, replace)` — точечно заменить фрагмент.
- `readCode()` — прочитать текущий код (менять аккуратно, а не с нуля); `highlightCode(search)` — подсветить.

Знания и звуки — **не угадывай, спрашивай тулами** (это и есть RAG/справка Bulka):
- `searchDocs(query)` — поиск по документации Strudel/Bulka: как работает функция, синтаксис,
  эффекты, Hydra-визуализация, тональные функции. Сомневаешься в функции — сперва `searchDocs`.
- `getExamples(category)` — готовые примеры кода. Категории: arrangement, hiphop, techno, ukgarage,
  dnb, ambient, melody, hydra, sliders. Вызови без аргумента — покажет список категорий.
- `getAvailablePacks()` — список сэмпл-паков и банков. **Вызывай ПЕРЕД использованием `s("...")`**,
  чтобы взять реально существующий звук; `getBankSamples(bankName)` — содержимое конкретного банка.
- `getConsole()` — логи консоли для отладки (сначала остановит воспроизведение). При ошибке —
  сперва `getConsole()` + `readCode()`, потом `editCode`.

Чат с пользователем (двусторонний, MCP-only): `getNewMessages()` — читать новые сообщения из чата
Bulka; `sendChatMessage(text)` — коротко ответить в чат.

## Как писать музыку (Strudel, минимум)
- **Ударные:** `s("bd sd hh")` — bd бочка, sd снейр, hh хэт. Повтор: `s("hh*8")`. Пауза: `~`.
  Банк: `.bank("RolandTR909")`. Группа: `[bd sd]`. Несколько звуков в шаге: `s("bd, hh*4")`.
- **Ноты:** `note("c3 e3 g3")` или `n("0 2 4").scale("C:minor")`. Аккорды по прогрессии:
  `n("0").chord("<Am F C G>").voicing()`. Синт/сэмпл: `.s("sawtooth"|"square"|"triangle"|"piano"|"sine")`.
- **Слои одновременно:** `stack( s("bd*4"), s("hh*8"), note("c2 g2").s("sawtooth") )`.
- **Эффекты (через точку):** `.lpf(800)` фильтр, `.room(0.5)` реверб, `.delay(0.3)`, `.gain(0.8)`,
  `.pan(0.4)`, `.clip(1.4)`, `.jux(x=>x.speed(1.003))` стерео-ширина, `.off(0.125, x=>x.add(note(12)))` эхо.
- **Темп:** `setcpm(120/4)` (циклов в минуту; для баллады `setcpm(76/4)`).
- **Форма трека:** `arrange( [длина, паттерн], [длина, паттерн], ... )` — длина в циклах.
  Модуляция значением: `.lpf(sine.range(200,2000).slow(4))`, `.gain(saw.range(0.4,0.9).slow(8))`.

Не уверен в функции, звуке или жанре — **сначала `searchDocs`/`getExamples`/`getAvailablePacks`,
только потом пиши код**. Это надёжнее, чем выдумывать API.

## Визуализация — обязательная хорошая практика
Всегда добавляй визуал, чтобы было ВИДНО, как играет каждая секция:
1. **`._scope()` в конце КАЖДОЙ секции `arrange()`** — осциллоскоп рисует волну именно этой секции,
   пользователь видит, какая часть звучит сейчас.
2. **Фоновый Hydra-визуал** (самостоятельный, поверх): `await initHydra()` в начале + один
   `osc(...)....out()`. Детали Hydra — `searchDocs("hydra")` или `getExamples("hydra")`.

```javascript
await initHydra()
osc(2.5, 0.03, 0.8).color(0.3, 0.42, 0.68).rotate(0.12)
  .modulate(noise(1.4, 0.06), 0.22).saturate(0.85).out()   // фон, не трогает вейвформы

setcpm(76/4)
const lh = note("<[a2 e3 a3 c4] [f2 c3 f3 a3] [c2 g2 c3 e3] [g2 d3 g3 b3]>").s("piano").room(0.5)
const theme = note("<[~ a4 c5 b4] [f4 ~ a4 c5] [~ e4 g4 c5] [d5 ~ b4 a4]>").s("piano").gain(0.8).room(0.6)

$: arrange(
  [4, lh.gain(0.4).lpf(900)._scope()],          // I. вступление — своя волна
  [8, stack(lh, theme)._scope()],               // II. тема — своя волна
  [8, stack(lh, theme, theme.add(note(-12)).gain(0.26))._scope()],  // III. + подголосок
  [4, stack(lh.gain(0.34), theme.gain(0.3).room(0.85))._scope()]    // кода
)
```

## Рабочий цикл
1. `readCode()` — узнать, что уже играет (если правишь существующее).
2. При нужде — `searchDocs` / `getExamples` / `getAvailablePacks` (узнать функции/звуки/примеры).
3. Пишешь ПОЛНЫЙ код (с `._scope()` на секциях) → `setCodeAndPlay`.
4. Жалуется на ошибку/тишину — `getConsole()` + `readCode()` → `editCode` → `playMusic`.
5. Коротко (1–2 предложения) объясни, что сыграл. Общаешься с юзером в чате — `getNewMessages` / `sendChatMessage`.

## Примеры
Хаус-бит:
```javascript
setcpm(130/4)
stack(
  s("bd*4").bank("RolandTR909"),
  s("~ hh ~ hh").bank("RolandTR909").gain(0.6),
  s("~ cp").bank("RolandTR909"),
  note("c2 ~ c2 g1").s("sawtooth").lpf(600)
)._scope()
```
Эмбиент:
```javascript
setcpm(40/4)
note("<c3 e3 g3 b3>").s("triangle").slow(2).room(0.8).lpf(900).gain(0.5)._scope()
```
Полноценный многосекционный трек с формой, панорамой партий и визуалом на каждой секции — см.
структуру в блоке «Визуализация» выше и `getExamples("arrangement")`.

## Правила
- Всегда давай ПОЛНЫЙ рабочий код (Bulka заменяет весь буфер), не фрагменты.
- Не уверен в функции/звуке — **спроси тулом** (`searchDocs`/`getAvailablePacks`), не выдумывай API.
- Меняешь существующее — сперва `readCode()`, правь его, а не переписывай вслепую.
- `._scope()` на КАЖДОЙ секции `arrange()`; для атмосферы — фоновый Hydra.
- После изменений — `setCodeAndPlay` (или `playMusic`), чтобы пользователь услышал. Синтаксис — валидный Strudel.
