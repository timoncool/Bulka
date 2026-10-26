#!/bin/bash
# Linux x86-64 AppImage (+ .sig апдейтера) и .deb Bulka, собранные на этой машине в контейнере Ubuntu 22.04 (glibc 2.35:
# работают там и на всём, что новее; Docker под WSL на Windows) из закоммиченного HEAD. На GitHub собирается только macOS.
#   bash desktop/build-linux-docker.sh <папка результата> [папка кэша]
# Из Windows запускать внутри WSL (пути /mnt/d/...). Ключ подписи апдейтера и пароль к нему:
#   BULKA_UPDATER_KEY (по умолчанию ~/.tauri/bulka-updater.key), BULKA_SECRETS (по умолчанию ~/.claude/secrets/bulka.env).
# Кэш держит Rust, Node, pnpm-store и cargo target между прогонами.
set -euo pipefail

PNPM_VER=11.22.0

# Every library the binaries need comes with the .deb dependencies (glibc and libstdc++ are always there).
check_needed_libs() {
  local deb="$1" bin lib path pkg allowed
  shift
  allowed="$( (dpkg-deb -f "$deb" Depends | tr ',' '\n' | sed 's/([^)]*)//g; s/|.*//; s/ //g'; printf '%s\n' libc6 libgcc-s1 libstdc++6) \
    | grep -v '^$' | xargs apt-cache depends --recurse --no-recommends --no-suggests --no-conflicts --no-breaks \
      --no-replaces --no-enhances | grep -v '^ ' | sed 's/:amd64$//' | sort -u)"
  for bin in "$@"; do
    for lib in $(objdump -p "$bin" | awk '$1 == "NEEDED" {print $2}'); do
      path="$(ldconfig -p | awk -v l="$lib" '$1 == l && /x86-64/ {print $NF; exit}')"
      [ -n "$path" ] || { echo "[ERROR] $(basename "$bin") needs $lib, which the build system does not have"; exit 1; }
      pkg="$(dpkg -S "$path" 2>/dev/null || dpkg -S "$(readlink -f "$path")" 2>/dev/null)" \
        || { echo "[ERROR] $(basename "$bin") needs $lib ($path), which no package owns"; exit 1; }
      pkg="${pkg%%:*}"
      grep -qx "$pkg" <<<"$allowed" || { echo "[ERROR] $(basename "$bin") needs $lib ($pkg), not a dependency of the .deb"; exit 1; }
    done
    echo "[..] $(basename "$bin"): every library comes with the .deb dependencies"
  done
}

if [ "${1:-}" = "--inside" ]; then
  # shellcheck source=node-pins.sh
  . /src/desktop/node-pins.sh
  export DEBIAN_FRONTEND=noninteractive APPIMAGE_EXTRACT_AND_RUN=1 RUSTUP_TOOLCHAIN=stable CARGO_TERM_COLOR=never
  export CARGO_HOME=/cache/cargo RUSTUP_HOME=/cache/rustup PATH=/cache/cargo/bin:/cache/node/bin:$PATH
  echo "[..] packages"
  apt-get update -q >/dev/null
  apt-get install -y -q --no-install-recommends build-essential pkg-config curl ca-certificates git unzip xz-utils file \
    libssl-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev patchelf libfuse2 binutils \
    gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-libav >/dev/null
  if [ ! -x /cache/node/bin/node ] || [ "$(/cache/node/bin/node -v)" != "$NODE_VER" ]; then
    echo "[..] node $NODE_VER"
    archive="$(fetch_node_archive linux-x64 /cache/node-dist)"
    rm -rf /cache/node && mkdir -p /cache/node
    tar -xJf "$archive" -C /cache/node --strip-components=1
  fi
  if [ ! -x /cache/node/bin/pnpm ] || [ "$(/cache/node/bin/pnpm -v)" != "$PNPM_VER" ]; then
    echo "[..] pnpm $PNPM_VER"
    npm install -g --silent "pnpm@$PNPM_VER" --prefix /cache/node
  fi
  if [ ! -x /cache/cargo/bin/cargo ]; then
    echo "[..] rust stable"
    curl -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable >/dev/null
  fi
  echo "[..] source $(git -c safe.directory=/src -C /src rev-parse --short HEAD)"
  rm -rf /cache/src && mkdir -p /cache/src
  git -c safe.directory=/src -C /src archive HEAD | tar -x -C /cache/src
  # Ключи Supabase (PUBLIC_*) вшиваются в клиент при сборке сайта; в git их нет.
  cp /keys/website.env /cache/src/website/.env
  cd /cache/src
  export CARGO_TARGET_DIR=/cache/target
  ln -sfn /cache/target desktop/src-tauri/target
  echo "[..] pnpm install (log: install.log)"
  pnpm install --frozen-lockfile --store-dir /cache/pnpm-store > /out/install.log 2>&1 \
    || { echo "[ERROR] pnpm install failed"; tail -40 /out/install.log; exit 1; }
  echo "[..] build (log: build.log)"
  BULKA_UPDATER_KEY=/keys/bulka-updater.key BULKA_SECRETS=/keys/bulka.env bash desktop/build.sh > /out/build.log 2>&1 \
    || { echo "[ERROR] build failed"; tail -40 /out/build.log; exit 1; }
  version="$(node -p "require('./desktop/src-tauri/tauri.conf.json').version")"
  appimage="$(find /cache/target/release/bundle/appimage -name "Bulka_${version}_amd64.AppImage" | head -n 1)"
  deb="$(find /cache/target/release/bundle/deb -name "Bulka_${version}_amd64.deb" | head -n 1)"
  [ -f "$appimage" ] && [ -f "$appimage.sig" ] && [ -f "$deb" ] || { echo "[ERROR] no AppImage, .sig or .deb of $version"; exit 1; }
  # Бинарь оболочки и бандлёный node не должны требовать glibc новее 2.35.
  for bin in /cache/target/release/bulka-desktop desktop/src-tauri/staging/app/node/node; do
    newest="$(objdump -T "$bin" | grep -o 'GLIBC_[0-9.]*' | sort -V | tail -n 1)"
    echo "[..] $(basename "$bin"): $newest"
    [ "$(printf '%s\nGLIBC_2.35\n' "$newest" | sort -V | tail -n 1)" = "GLIBC_2.35" ] || { echo "[ERROR] $bin needs $newest"; exit 1; }
  done
  check_needed_libs "$deb" /cache/target/release/bulka-desktop desktop/src-tauri/staging/app/node/node
  rm -f /out/Bulka_*_amd64.*
  cp "$appimage" "$appimage.sig" "$deb" /out/
  ls -la /out/Bulka_*
  echo "[OK] Bulka ${version} for Linux"
  exit 0
fi

out="${1:?папка результата}"
cache="${2:-$HOME/bulka-linux2204-cache}"
repo="$(cd "$(dirname "$0")/.." && pwd)"
key="${BULKA_UPDATER_KEY:-$HOME/.tauri/bulka-updater.key}"
secrets="${BULKA_SECRETS:-$HOME/.claude/secrets/bulka.env}"
[ -f "$key" ] || { echo "[ERROR] нет ключа подписи апдейтера: $key"; exit 1; }
[ -f "$secrets" ] || { echo "[ERROR] нет файла с паролем ключа: $secrets"; exit 1; }
[ -f "$repo/website/.env" ] || { echo "[ERROR] нет $repo/website/.env (ключи Supabase)"; exit 1; }
mkdir -p "$out" "$cache"
cp "$repo/desktop/build-linux-docker.sh" "$out/.build-linux-docker.sh"
docker run --rm -e CARGO_BUILD_JOBS="${CARGO_BUILD_JOBS:-8}" -v "$repo:/src:ro" -v "$(cd "$out" && pwd):/out" -v "$cache:/cache" \
  -v "$key:/keys/bulka-updater.key:ro" -v "$secrets:/keys/bulka.env:ro" -v "$repo/website/.env:/keys/website.env:ro" \
  ubuntu:22.04 bash /out/.build-linux-docker.sh --inside
