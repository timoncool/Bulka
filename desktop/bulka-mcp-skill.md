---
name: bulka-live-coding
description: Управление live-coding музыкой в приложении Bulka через MCP. Использовать, когда пользователь просит написать/изменить/запустить/остановить музыку, бит, мелодию, паттерн в Bulka (десктоп). Инструменты те же, что у встроенного агента Bulka: setFullCode, setCodeAndPlay, appendCode, editCode, readCode, playMusic, stopMusic, highlightCode, searchDocs (RAG по докам), getExamples, getAvailablePacks, getBankSamples, getConsole + двусторонний чат (getNewMessages, sendChatMessage).
---

# Bulka — live-coding музыки через MCP

Bulka (форк Strudel) — браузерный/десктопный редактор музыки кодом. Через MCP-сервер Bulka ты
пишешь и запускаешь музыку в реальном приложении пользователя.

## Подключение
Десктопная Bulka сама держит MCP на `http://127.0.0.1:4188/mcp`, пока приложение открыто. Ничего
запускать не надо — это HTTP-MCP по адресу. В `claude_desktop_config.json` (или конфиг Cursor):
```json
{ "mcpServers": { "bulka": { "type": "streamable-http", "url": "http://127.0.0.1:4188/mcp" } } }
```
Или в Claude Code: `claude mcp add --transport http bulka http://127.0.0.1:4188/mcp`.
Приложение Bulka должно быть открыто (иначе тулы вернут «окно не подключено»).

## Инструменты
Набор ТОЧНО такой же, как у встроенного агента Bulka (единый реестр). Редактор и звук:
- `setCodeAndPlay` — заменить весь код и сразу запустить (главный инструмент).
- `setFullCode` — заменить весь код без запуска; `playMusic` / `stopMusic` — запустить/остановить.
- `appendCode` — дописать партию к текущему коду; `editCode` — точечно заменить фрагмент (search/replace).
- `readCode` — прочитать текущий код (чтобы менять аккуратно, а не с нуля); `highlightCode` — подсветить фрагмент.

Знания и звуки (RAG — те же, что у встроенного агента):
- `searchDocs` — поиск по документации Strudel/Bulka (функции, синтаксис, Hydra, эффекты).
- `getExamples` — примеры кода по жанру (techno, hiphop, ambient, melody, hydra, sliders…).
- `getAvailablePacks` — список сэмпл-паков; `getBankSamples` — содержимое конкретного банка.
- `getConsole` — логи консоли для отладки (сначала остановит воспроизведение).

Чат с пользователем (двусторонний):
- `getNewMessages` — прочитать новые сообщения из чата Bulka; `sendChatMessage` — ответить в чат.

**Рабочий цикл:** `readCode` (что играет) → при нужде `searchDocs`/`getExamples`/`getAvailablePacks` →
правишь → `setCodeAndPlay`. Для новой идеи — сразу `setCodeAndPlay`. Пользователь слышит результат мгновенно.
Жалуется на ошибку — `getConsole` + `readCode`, потом `editCode`.

## Язык Strudel (кратко)
- Ударные: `s("bd sd hh")` — bd бочка, sd снейр, hh хэт. Повтор: `s("hh*8")`. Пауза: `~`.
  Банк: `.bank("RolandTR808")`. Группировка: `[bd sd]`, стек в одном шаге: `s("bd, hh*4")`.
- Ноты: `note("c3 e3 g3")` или `n("0 2 4").scale("C:minor")`. Синт: `.s("sawtooth"|"square"|"triangle"|"piano")`.
- Слои одновременно: `stack( s("bd*4"), s("hh*8"), note("c2 g2").s("sawtooth") )`.
- Эффекты (через точку): `.lpf(800)` фильтр, `.room(0.4)` реверб, `.delay(0.3)`, `.gain(0.8)`,
  `.pan(sine)`, `.speed(2)`, `.crush(4)`. Темп: `setcpm(120/4)` (циклов в минуту).
- Модуляция значением: `.lpf(sine.range(200,2000).slow(4))`.

## Примеры
Хаус-бит:
```javascript
setcpm(130/4)
stack(
  s("bd*4").bank("RolandTR909"),
  s("~ hh ~ hh").bank("RolandTR909").gain(0.6),
  s("~ cp").bank("RolandTR909"),
  note("c2 ~ c2 g1").s("sawtooth").lpf(600)
)
```
Эмбиент:
```javascript
setcpm(40/4)
note("<c3 e3 g3 b3>").s("triangle").slow(2).room(0.8).lpf(900).gain(0.5)
```

## Правила
- Всегда давай ПОЛНЫЙ рабочий код (Bulka заменяет весь буфер), не фрагменты.
- Меняешь существующее — сперва `get_code`, правь его, а не переписывай вслепую.
- После изменений — `set_code_and_play` (или `play`), чтобы пользователь услышал.
- Коротко объясняй, что сыграл (1–2 предложения). Синтаксис — валидный Strudel.
