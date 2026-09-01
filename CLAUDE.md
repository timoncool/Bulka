# CLAUDE.md — Bulka

Bulka — русскоязычный форк [Strudel](https://codeberg.org/uzu/strudel) (лайв-кодинг музыки) со встроенным AI-агентом. Astro-монорепо на pnpm (`@bulka/monorepo`), деплой на **Vercel** (проект `bulka`, домен **bulka.app**).

## Структура
- `packages/*` — движок Strudel (`@strudel/core`, `superdough`, `codemirror`, `webaudio`, `xen`, `edo`, …). Держится максимально близко к upstream.
- `website/` — само приложение (Astro + React). Здесь живут кастомизации Bulka: русский UI, AI-агент, провайдеры, локализация. **Root Directory на Vercel = repo root**, но выхлоп — `website/dist`.
- `doc.json` (корень) — справочник функций для панели «справка» в REPL.

## Сборка и запуск
- `pnpm i`, затем `pnpm --filter website dev` (localhost:4321) или `pnpm dev`.
- Проверять сборку: `pnpm --filter website build` (из-за pnpm 11 может понадобиться `PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false`).
- Прод-деплой Vercel — только с ветки `main` (preview других веток режет «Ignored Build Step»).

## 🔴 doc.json — КУРИРУЕМЫЙ РУССКИЙ справочник, НЕ регенерировать вслепую
Панель «справка» рендерит `doc.json`. Описания функций в нём **переведены на русский вручную** (докстринги в `packages/` — английские). Скрипт `jsdoc-json` регенерирует `doc.json` из английских докстрингов и **затирает перевод** — поэтому он УБРАН из `prebuild` (`package.json`). Не возвращай его в `prebuild`/сборку.
- Добавил/обновил функции движка → нужно обновить `doc.json` вручную: `npm run jsdoc-json` даёт свежую (английскую) структуру, затем перенеси старые русские описания по имени функции и переведи новые (см. историю коммитов `fix(reference): restore RUSSIAN…`). Итог коммить как русский `doc.json`.

## 🔴 Синхронизация с upstream Strudel
Bulka — squash-снимок, **общего git-предка с Codeberg нет напрямую**. Механика (уже настроена):
- Ветка **`strudel-sync`** = дерево Bulka поверх upstream-базы `d198910a8` (синтетический предок) → в ней `git merge upstream/main` работает как обычный 3-way.
- Резолвинг: **`packages/*` → сторона upstream** (движок), **`website/*` → сторона Bulka** (UI). Затем `git checkout upstream/main -- packages/` целиком (когерентность движка) и удалить upstream-«сироты» в website.
- **Фичи Bulka в движке портируются ВПЕРЁД вручную**: запись (`startRecording/stopRecording/isRecording` + `encodeWAV` в `superdough`) и master-volume. Новый пакет для REPL подключать в `website/package.json` + в `evalScope` (`website/src/repl/util.mjs`).
- Приземление на `main`: `git checkout main; git read-tree --reset -u strudel-sync; git commit`.
- upstream remote: `https://codeberg.org/uzu/strudel.git`.

## AI-агент
- Системный промпт: `website/src/repl/ai-agent/system-prompt.ts`; база знаний: `.../knowledge.ts`; инструменты: `.../tools.ts`.
- RAG-поиск (`searchDocs`) идёт по `website/src/data/docs-index.json` — регенерируется `node website/scripts/build-docs-index.js` (сканирует все `.mdx`). После добавления страниц/фич — обновить и его, и промпт/базу знаний, иначе агент не узнает о новом.
- Провайдеры (OpenAI/Anthropic/Gemini/Z.AI/OpenRouter/GPT4Free) вызываются **сырым REST** в `website/src/pages/api/chat.ts`; список моделей тянется живьём (`.../api/models.ts`). Модель выбирается динамически (не захардкожена).

## Supabase (сохранение/шеринг паттернов)
- Клиент — `website/src/repl/util.mjs` (+ SSR в `website/src/pages/index.astro`), таблица `code_v1`, RLS на anon select/insert/update.
- URL/ключ — в env (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`; Astro отдаёт `PUBLIC_*` в клиент). Значения — в `website/.env` (gitignored) и в переменных Vercel. Publishable-ключ публичный, данные защищает RLS.

## Домен
bulka.app проксируется через RU-nginx (Vercel недоступен из РФ напрямую). Если домен отдаёт 403 при живом `*.vercel.app` — это domain fronting: в конфиге nginx `proxy_set_header Host` должен совпадать с `proxy_ssl_name` (алиас `bulka-ru.vercel.app`).

## Конвенции
- Интерфейс и документация — на русском. Названия функций/кода — английские.
- Новые страницы доков: `layout: MainLayout.astro`, компоненты `MiniRepl`/`JsDoc`, регистрировать в `website/src/config.ts`.
