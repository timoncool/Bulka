#!/usr/bin/env bash
# Воспроизводимая сборка десктопа Bulka на текущей ОС:
#   Astro node-standalone сервер + бандлёный node  ->  Tauri-бандлы
#   Windows: NSIS-установщик + .sig; Linux: AppImage + .sig и .deb; macOS: .app и .dmg (подпись апдейтера — в make-release.sh).
# Запуск: bash desktop/build.sh. Linux собирается в Docker (desktop/build-linux-docker.sh), macOS — на GitHub (macOS build).
#
# Требования: pnpm, Rust/cargo, @tauri-apps/cli (в node_modules); для Windows и Linux — ключ подписи апдейтера
# (BULKA_UPDATER_KEY, по умолчанию ~/.tauri/bulka-updater.key) и пароль (BULKA_UPDATER_PASSWORD или ~/.claude/secrets/bulka.env).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESK="$ROOT/desktop"
STAGE="$DESK/src-tauri/staging/app"
NODE_VER="${BULKA_NODE_VER:-v24.21.0}"

case "$(uname -s)" in
  MINGW* | MSYS* | CYGWIN*) OS=win ;;
  Linux) OS=linux ;;
  Darwin) OS=darwin ;;
  *) echo "[ERROR] неизвестная ОС: $(uname -s)"; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64 | amd64) ARCH=x64 ;;
  arm64 | aarch64) ARCH=arm64 ;;
  *) echo "[ERROR] неизвестная архитектура: $(uname -m)"; exit 1 ;;
esac
NODE_BIN=node
[ "$OS" = win ] && NODE_BIN=node.exe
NODE_CACHE="$DESK/src-tauri/node/$NODE_VER-$OS-$ARCH/$NODE_BIN"

# Ключ апдейтера нужен до долгой сборки: без него tauri build падает в самом конце.
if [ "$OS" != darwin ]; then
  KEY="${BULKA_UPDATER_KEY:-$HOME/.tauri/bulka-updater.key}"
  [ -f "$KEY" ] || { echo "[ERROR] нет ключа подписи апдейтера: $KEY"; exit 1; }
  if [ -z "${BULKA_UPDATER_PASSWORD:-}" ]; then
    SECRETS="${BULKA_SECRETS:-$HOME/.claude/secrets/bulka.env}"
    [ -f "$SECRETS" ] || { echo "[ERROR] нет пароля ключа: задай BULKA_UPDATER_PASSWORD или положи его в $SECRETS"; exit 1; }
    BULKA_UPDATER_PASSWORD="$(sed -n 's/^BULKA_UPDATER_PASSWORD=//p' "$SECRETS" | tr -d '\r')"
    [ -n "$BULKA_UPDATER_PASSWORD" ] || { echo "[ERROR] в $SECRETS нет строки BULKA_UPDATER_PASSWORD="; exit 1; }
  fi
fi

echo "[1/5] Сборка сайта (Astro node adapter, DESKTOP=1)"
cd "$ROOT"
DESKTOP=1 PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false pnpm --filter website build

echo "[2/5] Staging: dist + node $NODE_VER ($OS-$ARCH)"
rm -rf "$DESK/src-tauri/staging"
mkdir -p "$STAGE/node"
cp -r "$ROOT/website/dist" "$STAGE/dist"
if [ ! -f "$NODE_CACHE" ]; then
  echo "  качаю node $NODE_VER с nodejs.org"
  DL="$(mktemp -d)"
  if [ "$OS" = win ]; then
    PKG="node-$NODE_VER-win-$ARCH.zip"
  elif [ "$OS" = linux ]; then
    PKG="node-$NODE_VER-linux-$ARCH.tar.xz"
  else
    PKG="node-$NODE_VER-darwin-$ARCH.tar.gz"
  fi
  curl -fsSL "https://nodejs.org/dist/$NODE_VER/$PKG" -o "$DL/$PKG"
  curl -fsSL "https://nodejs.org/dist/$NODE_VER/SHASUMS256.txt" -o "$DL/SHASUMS256.txt"
  WANT="$(grep " $PKG\$" "$DL/SHASUMS256.txt" | cut -d' ' -f1)"
  GOT="$(sha256sum "$DL/$PKG" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$DL/$PKG" | cut -d' ' -f1)"
  [ -n "$WANT" ] && [ "$WANT" = "$GOT" ] || { echo "[ERROR] контрольная сумма $PKG не сошлась"; exit 1; }
  mkdir -p "$(dirname "$NODE_CACHE")"
  if [ "$OS" = win ]; then
    unzip -q -j "$DL/$PKG" "node-$NODE_VER-win-$ARCH/node.exe" -d "$(dirname "$NODE_CACHE")"
  else
    tar -xf "$DL/$PKG" -C "$DL" "node-$NODE_VER-$OS-$ARCH/bin/node"
    cp "$DL/node-$NODE_VER-$OS-$ARCH/bin/node" "$NODE_CACHE"
  fi
  rm -rf "$DL"
fi
cp "$NODE_CACHE" "$STAGE/node/$NODE_BIN"
chmod +x "$STAGE/node/$NODE_BIN"

echo "[3/5] Production node_modules (плоский, hoisted — иначе node не резолвит транзитивные)"
DEPLOY_DIR="$(mktemp -d)"
DEPLOY_LOG="$DESK/src-tauri/staging/pnpm-deploy.log"
if ! PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false \
  pnpm --filter @bulka/website --config.node-linker=hoisted deploy --prod --legacy "$DEPLOY_DIR" >"$DEPLOY_LOG" 2>&1; then
  echo "[ERROR] pnpm deploy упал, лог: $DEPLOY_LOG"
  tail -n 30 "$DEPLOY_LOG"
  exit 1
fi
rm -rf "$STAGE/node_modules"
cp -rL "$DEPLOY_DIR/node_modules" "$STAGE/node_modules"
rm -rf "$DEPLOY_DIR"

echo "[4/5] Удаление build-only пакетов (SSR-сервер их в рантайме не грузит)"
cd "$STAGE/node_modules"
for p in \
  google-closure-compiler google-closure-compiler-* google-closure-library \
  typescript @img sharp esbuild @esbuild @babel lightningcss lightningcss-* \
  tailwindcss @tailwindcss rollup @rollup vite @vitejs eslint @types terser \
  postcss autoprefixer @serialport serialport prettier @csound standardized-audio-context \
  @ai-sdk ai jazz-midi webmidi prismjs @opentelemetry automation-events \
  @shikijs caniuse-lite css-tree csso jiti tar browserslist svgo ; do
  rm -rf ./$p
done
# ВАЖНО: react-aria / react-stately / @internationalized НУЖНЫ в рантайме (SSR React) — НЕ удалять.
cd "$ROOT"

echo "[5/5] tauri build"
cd "$DESK"
if [ "$OS" != darwin ]; then
  export TAURI_SIGNING_PRIVATE_KEY="$(cat "$KEY")"
  export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$BULKA_UPDATER_PASSWORD"
fi
"$ROOT/node_modules/.bin/tauri" build

if [ "$OS" != darwin ]; then
  echo "[..] Проверка бинарей: импорты DLL и AVX-512"
  SHELL_BIN="$DESK/src-tauri/target/release/bulka-desktop"
  [ "$OS" = win ] && SHELL_BIN="$SHELL_BIN.exe"
  node "$DESK/check-binaries.mjs" --shell "$SHELL_BIN" --map "$DESK/src-tauri/target/release/bulka-desktop.map" \
    --node "$STAGE/node/$NODE_BIN"
fi

BUNDLE="desktop/src-tauri/target/release/bundle"
echo ""
case "$OS" in
  win) echo "[OK] Установщик: $BUNDLE/nsis/*-setup.exe. Портатив: bash desktop/pack-portable.sh" ;;
  linux) echo "[OK] Linux: $BUNDLE/appimage/*.AppImage (+ .sig), $BUNDLE/deb/*.deb" ;;
  darwin) echo "[OK] macOS: $BUNDLE/macos/Bulka.app, $BUNDLE/dmg/*.dmg" ;;
esac
