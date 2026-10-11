# Bulka Desktop (портативное Windows-приложение)

Оболочка Tauri v2: поднимает автономный **Astro Node-сервер** Bulka на `127.0.0.1:<свободный порт>`
дочерним процессом `node.exe` и открывает нативное окно WebView2 на этот URL. Сервер сам раздаёт SPA
и API (`/api/chat`, `/api/models`) на одном origin — весь функционал сайта работает локально.

## Портативность / изоляция

- Всё живёт **рядом с exe**: `app/dist` (сайт), `app/node/node.exe` (рантайм), `app/node_modules`
  (только рантайм-зависимости сервера), `webview-data/` (localStorage → **твои ключи и настройки**).
  Ничего не пишется в систему/AppData. **Удалил папку — удалил приложение.**
- Закрыл окно → дочерний Node-сервер убивается (`RunEvent::Exit`), процессов не остаётся.
- Свои ключи (OpenAI/Anthropic/Gemini/Z.AI/OpenRouter) вводятся в UI и хранятся в `webview-data/`.
  Бесплатный режим (OVHcloud) работает без ключа.

## Сборка

```bash
# 1) установщик (.exe) + updater-артефакты
bash desktop/build.sh
#    -> desktop/src-tauri/target/release/bundle/nsis/Bulka_<ver>_x64-setup.exe

# 2) портативный zip (та же раскладка, без установщика)
bash desktop/pack-portable.sh
#    -> desktop/dist-portable/Bulka-portable.zip
```

`build.sh` детерминирован: собирает сайт (`DESKTOP=1` → node-адаптер), готовит `staging/app`
(dist + `node.exe` + **плоский** prod-`node_modules` через `pnpm deploy --node-linker=hoisted`),
вырезает build-only пакеты (typescript/esbuild/sharp/tailwind/rollup/… — сервер их в рантайме не
грузит), затем `tauri build`. **react-aria / react-stately / @internationalized НУЖНЫ** (SSR React) —
их скрипт не трогает.

## Требования сборки

- Rust/cargo, Node+pnpm, WebView2 (в Windows 11 предустановлен; иначе NSIS докачает bootstrapper).
- Ключ подписи авто-апдейта: `~/.tauri/bulka-updater.key` (+ пароль в env
  `BULKA_UPDATER_PASSWORD`). Публичный ключ вшит в `src-tauri/tauri.conf.json`.

## Авто-обновление

Установленная сборка при старте проверяет последний GitHub-релиз; при новой версии предлагает
скачать подписанный `setup.exe` и перезапуститься. Портативная — предлагает открыть страницу релиза.
Манифест — `latest.json` рядом с ассетами релиза (эндпоинт в `tauri.conf.json`).

## Стек и почему Tauri (а не Electron)

Как в остальных десктоп-приложениях автора (dub-studio, MiniMax Studio) — **Tauri v2**: маленький
бандл (системный WebView2), NSIS-установщик из коробки, авто-апдейт. Отличие Bulka: сервер не Rust-крейт,
а **Node** (агент на JS), поэтому поднимается дочерним `node.exe` (`src-tauri/src/lib.rs`).
