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
Панель «справка» рендерит `doc.json`. Описания функций в нём **переведены на русский вручную** (докстринги в `packages/` — английские). Английский оригинал — `doc.en.json`.
- Добавил/обновил функции движка: `pnpm jsdoc-json` пишет свежую английскую структуру в `doc.en.json` (русский `doc.json` не трогает), затем `pnpm doc-ru` переносит русские тексты в новую структуру по имени функции и печатает записи без перевода (код выхода 1). Переведи их прямо в `doc.json` и запусти `pnpm doc-ru` ещё раз — до нуля.
- Тесты — `pnpm test` (`vitest run`); `jsdoc-json` ни в тесты, ни в сборку не встроен.

## 🔴 Синхронизация с upstream Strudel
Bulka — squash-снимок, **общего git-предка с Codeberg нет напрямую**. Механика (уже настроена):
- Ветка **`strudel-sync`** = дерево Bulka поверх upstream-базы `d198910a8` (синтетический предок) → в ней `git merge upstream/main` работает как обычный 3-way.
- Резолвинг: **`packages/*` → сторона upstream** (движок), **`website/*` → сторона Bulka** (UI). Затем `git checkout upstream/main -- packages/` целиком (когерентность движка) и удалить upstream-«сироты» в website.
- **Фичи Bulka в движке портируются ВПЕРЁД вручную**: запись (`startRecording/stopRecording/isRecording` + `encodeWAV` в `superdough`) и master-volume; в `superdough/audioContext.mjs` `setAudioContext` не зовёт `close()` у контекста без него (у OfflineAudioContext в WebKit его нет — иначе экспорт WAV в Safari, Linux и macOS падает). Новый пакет для REPL подключать в `website/package.json` + в `evalScope` (`website/src/repl/util.mjs`).
- Приземление на `main`: `git checkout main; git read-tree --reset -u strudel-sync; git commit`.
- upstream remote: `https://codeberg.org/uzu/strudel.git`.
- После синка: `node website/scripts/sync-en-docs.mjs` (английские страницы — оригиналы апстрима), `pnpm jsdoc-json` + `pnpm doc-ru` (справка), `node website/scripts/build-docs-index.js`.

## 🔴 Два языка: русский на корне, английский под `/en/`
- Язык страницы — по URL (`website/src/i18n/lang.mjs`). Строки интерфейса — только через `t('ключ')` из `website/src/i18n`, ключ сразу в `ru.mjs` и `en.mjs` (тест `test/i18n.test.mjs` сверяет оба словаря).
- Доки: `website/src/pages/en/**` — оригиналы апстрима (скрипт `sync-en-docs.mjs`, вручную не править) плюс переводы страниц Bulka, которых в апстриме нет. Новая страница Bulka = русская версия + английская в `pages/en/`, пункт в обоих меню `SIDEBAR.ru` / `SIDEBAR.en` (`website/src/config.ts`).
- Посты блога на английском — `website/src/content/blog/en/` с `lang: en`.

## AI-агент
- Системный промпт и реестр инструментов: `SYSTEM_PROMPT` и `TOOLS_OPENAI` в `website/src/pages/api/chat.ts`; у бесплатного провайдера свой `FREE_SYSTEM_PROMPT` в `website/src/repl/useChatContext.jsx`; база знаний: `website/src/repl/ai-agent/knowledge.ts`.
- RAG-поиск (`searchDocs`) идёт по `website/src/data/docs-index.json` — регенерируется `node website/scripts/build-docs-index.js` (сканирует все `.mdx`). После добавления страниц/фич — обновить и его, и промпт/базу знаний, иначе агент не узнает о новом.
- Провайдеры с ключом (OpenAI/Anthropic/Gemini/Z.AI/OpenRouter) вызываются **сырым REST** в `website/src/pages/api/chat.ts`; список моделей тянется живьём (`.../api/models.ts`). Модель выбирается динамически (не захардкожена).
- Бесплатный провайдер (`'free'`) — **OVHcloud AI Endpoints**, OpenAI-совместимый, вызывается **прямым fetch из браузера** в `website/src/repl/useChatContext.jsx` (без ключа/регистрации, минуя сервер и RU-прокси — IP=юзера). Лимит бесплатного тарифа 2 запроса/мин на IP. Другие бесплатные варианты (proof-of-work / вход в аккаунт / Turnstile-капча) не подошли. Doc-страница: `website/src/pages/learn/free-ai.mdx`.

## Supabase (сохранение/шеринг паттернов)
- Клиент — `website/src/repl/util.mjs` (+ SSR в `website/src/components/ReplPage.astro`), таблица `code_v1`, RLS на anon select/insert/update.
- URL/ключ — в env (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`; Astro отдаёт `PUBLIC_*` в клиент). Значения — в `website/.env` (gitignored) и в переменных Vercel. Publishable-ключ публичный, данные защищает RLS.

## Домен
bulka.app проксируется через RU-nginx (Vercel недоступен из РФ напрямую). Если домен отдаёт 403 при живом `*.vercel.app` — это domain fronting: в конфиге nginx `proxy_set_header Host` должен совпадать с `proxy_ssl_name` (алиас `bulka-ru.vercel.app`).

## Конвенции
- Интерфейс и документация — на русском и английском (см. «Два языка»). Названия функций/кода — английские.
- Новые страницы доков: `layout: MainLayout.astro`, компоненты `MiniRepl`/`JsDoc`, регистрировать в `website/src/config.ts`.

## Статистика и новости (Studio Hub)
- Новости и полоски — скрипт хаба `embed/notices.js` в `website/src/components/HeadCommon.astro` (`data-app="bulka"`); события показов он шлёт только после согласия на статистику (`data-events`).
- Статистика — `website/src/hub/` (формат и лимиты Rust-клиента студий `studio-hub-client`): ничего не считается и не уходит, пока человек не нажал «Готово» в панели согласия; счётчики `<дело>_done` / `<дело>_failed` + обезличенная причина.
- Локально: `PUBLIC_STUDIO_HUB_URL=http://127.0.0.1:8787` (локальный хаб `npx wrangler dev`), без неё в dev статистика выключена. Десктоп узнаётся по `BULKA_DESKTOP=1` от Rust-оболочки; тестовые уведомления — `STUDIO_HUB_TEST=1`.
