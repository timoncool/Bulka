#!/usr/bin/env bash
# Портативная сборка Bulka: раскладка «exe + app/ рядом» (та же, что ставит NSIS), упакованная в zip.
# Запускать ПОСЛЕ desktop/build.sh (нужны target/release/*.exe и staging/app).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESK="$ROOT/desktop"
STAGE="$DESK/src-tauri/staging/app"
REL="$DESK/src-tauri/target/release"

# Основной бинарь (имя = cargo package "bulka-desktop"); в портативе переименуем в Bulka.exe.
EXE="$(ls "$REL"/bulka-desktop.exe "$REL"/Bulka.exe 2>/dev/null | head -1 || true)"
[ -n "${EXE:-}" ] && [ -f "$EXE" ] || { echo "нет собранного exe в $REL — сначала bash desktop/build.sh"; exit 1; }
[ -d "$STAGE" ] || { echo "нет staging/app — сначала bash desktop/build.sh"; exit 1; }

OUT="$DESK/dist-portable"
APP="$OUT/Bulka"
rm -rf "$OUT"
mkdir -p "$APP/app"
cp "$EXE" "$APP/Bulka.exe"
cp -r "$STAGE/dist"          "$APP/app/dist"
cp -r "$STAGE/node"          "$APP/app/node"
cp -r "$STAGE/node_modules"  "$APP/app/node_modules"

echo "Размер портатива:"; du -sh "$APP" 2>/dev/null | cut -f1

# zip средствами PowerShell (кроссплатформенно на Windows-раннере)
cd "$OUT"
powershell -NoProfile -Command "Compress-Archive -Path 'Bulka' -DestinationPath 'Bulka-portable.zip' -Force"
echo "Готово: desktop/dist-portable/Bulka-portable.zip"
