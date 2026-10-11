#!/usr/bin/env bash
# Воспроизводимая сборка десктопа Bulka:
#   Astro node-standalone сервер + бандлёный node.exe  ->  Tauri NSIS-установщик (+ updater-артефакты).
# Всё кладётся рядом с exe (портативно). Запуск: bash desktop/build.sh
#
# Требования: pnpm, Rust/cargo, @tauri-apps/cli (в node_modules), ключ подписи ~/.tauri/bulka-updater.key.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESK="$ROOT/desktop"
STAGE="$DESK/src-tauri/staging/app"
NODE_VER="${BULKA_NODE_VER:-v24.11.0}"
NODE_CACHE="$DESK/src-tauri/node/node.exe"

echo "[1/5] Сборка сайта (Astro node adapter, DESKTOP=1)"
cd "$ROOT"
DESKTOP=1 PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false pnpm --filter website build

echo "[2/5] Staging: dist + node.exe"
rm -rf "$DESK/src-tauri/staging"
mkdir -p "$STAGE/node"
cp -r "$ROOT/website/dist" "$STAGE/dist"
if [ -f "$NODE_CACHE" ]; then
  cp "$NODE_CACHE" "$STAGE/node/node.exe"
else
  echo "  качаю node.exe $NODE_VER с nodejs.org…"
  mkdir -p "$(dirname "$NODE_CACHE")"
  curl -fL "https://nodejs.org/dist/$NODE_VER/win-x64/node.exe" -o "$NODE_CACHE"
  cp "$NODE_CACHE" "$STAGE/node/node.exe"
fi

echo "[3/5] Production node_modules (плоский, hoisted — иначе node не резолвит транзитивные)"
TMP="$(mktemp -d)"
PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false \
  pnpm --filter @bulka/website --config.node-linker=hoisted deploy --prod --legacy "$TMP" >/dev/null 2>&1 || true
rm -rf "$STAGE/node_modules"
cp -rL "$TMP/node_modules" "$STAGE/node_modules"
rm -rf "$TMP"

echo "[4/5] Удаление build-only пакетов (SSR-сервер их в рантайме не грузит)"
cd "$STAGE/node_modules"
for p in \
  google-closure-compiler google-closure-compiler-windows google-closure-compiler-java \
  google-closure-compiler-linux google-closure-compiler-osx google-closure-library \
  typescript @img sharp esbuild @esbuild @babel lightningcss lightningcss-win32-x64-msvc \
  tailwindcss @tailwindcss rollup @rollup vite @vitejs eslint @types terser \
  postcss autoprefixer @serialport serialport prettier @csound standardized-audio-context \
  @ai-sdk ai jazz-midi webmidi prismjs @opentelemetry automation-events \
  @shikijs caniuse-lite css-tree csso jiti tar browserslist svgo ; do
  rm -rf "./$p"
done
# ВАЖНО: react-aria / react-stately / @internationalized НУЖНЫ в рантайме (SSR React) — НЕ удалять.
cd "$ROOT"

echo "[5/5] tauri build (NSIS + updater .sig)"
cd "$DESK"
export TAURI_SIGNING_PRIVATE_KEY="$(cat "$HOME/.tauri/bulka-updater.key")"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="${BULKA_UPDATER_PASSWORD:-bulka_upd_2026}"
"$ROOT/node_modules/.bin/tauri" build

echo ""
echo "Готово. Установщик: desktop/src-tauri/target/release/bundle/nsis/*-setup.exe"
echo "Портативную сборку собрать: bash desktop/pack-portable.sh"
