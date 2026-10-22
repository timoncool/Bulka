# Bulka Desktop (Windows, Linux, macOS)

Оболочка Tauri v2: поднимает автономный **Astro Node-сервер** Bulka на `127.0.0.1:4188` (занят — свободный порт)
дочерним процессом бандлёного `node` и открывает нативное окно (WebView2 / WebKitGTK / WKWebView) на этот URL.
Сервер сам раздаёт SPA и API (`/api/chat`, `/api/models`, `/mcp`) на одном origin — весь функционал сайта работает
локально. Не поднялся сервер — окно с ошибкой и путём к логу `bulka-server.log`, а не пустое окно.

## Где что лежит

| | Ресурсы (`app/`: dist, node, node_modules) | Данные (записи, `bulka-server.log`) | Ключи и настройки (localStorage) |
|---|---|---|---|
| Windows | рядом с exe | рядом с exe | `webview-data/` рядом с exe |
| Linux (AppImage, .deb) | внутри бандла (`/usr/lib/Bulka`) | `~/.local/share/app.bulka.desktop` | там же |
| macOS | `Bulka.app/Contents/Resources` | `~/Library/Application Support/app.bulka.desktop` | там же |

Закрыл окно → окно отправляет накопленную статистику (если она включена, до 8 с, `/api/desktop/flush`), потом
дочерний Node-сервер убивается, процессов не остаётся.

## Сборка

```bash
# Windows: установщик (.exe) + updater-артефакты, затем портативный zip
bash desktop/build.sh
bash desktop/pack-portable.sh
```

```bash
# Linux (AppImage + .sig, .deb): в Docker под WSL, Ubuntu 22.04 (glibc 2.35), из закоммиченного HEAD
bash desktop/build-linux-docker.sh desktop/dist-linux
```

macOS (.dmg и архив `.app.tar.gz` для апдейтера) собирается на GitHub: workflow **macOS build**
(`.github/workflows/release-macos.yml`, `workflow_dispatch`, поле `tag`). Ему нужны переменные репозитория
`PUBLIC_SUPABASE_URL` и `PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

`build.sh` собирает под текущую ОС: сайт (`DESKTOP=1` → node-адаптер), `staging/app` (dist + node нужной ОС с
nodejs.org с проверкой SHA-256 + **плоский** prod-`node_modules` через `pnpm deploy --node-linker=hoisted`), вырезает
build-only пакеты (typescript/esbuild/sharp/tailwind/rollup/… — сервер их в рантайме не грузит), затем `tauri build`.
**react-aria / react-stately / @internationalized НУЖНЫ** (SSR React) — их скрипт не трогает. Платформенные настройки
бандла — `src-tauri/tauri.linux.conf.json` (AppImage с GStreamer для звука WebKitGTK, зависимости .deb) и
`src-tauri/tauri.macos.conf.json`.

## Требования сборки

- Rust/cargo, Node + pnpm; для Linux — Docker под WSL.
- Ключ подписи авто-апдейта: `~/.tauri/bulka-updater.key` (путь меняет `BULKA_UPDATER_KEY`), пароль — env
  `BULKA_UPDATER_PASSWORD` или строка `BULKA_UPDATER_PASSWORD=` в `~/.claude/secrets/bulka.env` (`BULKA_SECRETS`).
  Публичный ключ вшит в `src-tauri/tauri.conf.json`. Без ключа сборка Windows и Linux останавливается с ошибкой.

## Релиз и авто-обновление

`bash desktop/make-release.sh` — когда готовы все три сборки: скачивает артефакт «macOS build» этого же коммита,
подписывает `.app.tar.gz` ключом апдейтера, собирает `latest.json` (`windows-x86_64`, `linux-x86_64`,
`darwin-aarch64`) и создаёт GitHub-релиз со всеми файлами.

При старте приложение проверяет последний релиз. Установленная Windows-сборка, AppImage и macOS предлагают обновиться
на месте и перезапуститься; портатив Windows и .deb — открыть страницу релизов.

## Стек и почему Tauri (а не Electron)

Как в остальных десктоп-приложениях автора (dub-studio, MiniMax Studio) — **Tauri v2**: маленький бандл (системный
WebView), установщики из коробки, авто-апдейт. Отличие Bulka: сервер не Rust-крейт, а **Node** (агент на JS), поэтому
поднимается дочерним `node` (`src-tauri/src/lib.rs`).
