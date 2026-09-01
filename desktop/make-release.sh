#!/usr/bin/env bash
# Публикация десктоп-релиза Bulka: собирает latest.json (манифест авто-апдейтера) и создаёт
# GitHub-релиз с установщиком (.exe), портативным zip и latest.json.
# Запускать ПОСЛЕ desktop/build.sh (+ желательно desktop/pack-portable.sh).
#
# Требует: gh (авторизован в timoncool/Bulka). Тег по умолчанию desktop-v<version>.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESK="$ROOT/desktop"
NSIS_DIR="$DESK/src-tauri/target/release/bundle/nsis"
REPO="timoncool/Bulka"

VER="$(node -pe "require('$DESK/src-tauri/tauri.conf.json').version")"
TAG="${BULKA_RELEASE_TAG:-desktop-v$VER}"
SETUP="$(ls "$NSIS_DIR"/*-setup.exe 2>/dev/null | head -1)"
SIG_FILE="$(ls "$NSIS_DIR"/*-setup.exe.sig 2>/dev/null | head -1)"
PORTABLE="$DESK/dist-portable/Bulka-portable.zip"

[ -f "$SETUP" ]     || { echo "нет setup.exe в $NSIS_DIR — сначала bash desktop/build.sh"; exit 1; }
[ -f "$SIG_FILE" ]  || { echo "нет .sig (подпись апдейтера) — проверь TAURI_SIGNING_* при build.sh"; exit 1; }

SETUP_NAME="$(basename "$SETUP")"
SIG="$(cat "$SIG_FILE")"
PUB_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
URL="https://github.com/$REPO/releases/download/$TAG/$SETUP_NAME"

# Манифест апдейтера (Tauri v2). Эндпоинт в tauri.conf.json -> releases/latest/download/latest.json
LATEST="$DESK/src-tauri/target/release/bundle/nsis/latest.json"
cat > "$LATEST" <<JSON
{
  "version": "$VER",
  "notes": "Bulka Desktop $VER",
  "pub_date": "$PUB_DATE",
  "platforms": {
    "windows-x86_64": {
      "signature": "$SIG",
      "url": "$URL"
    }
  }
}
JSON
echo "latest.json собран ($LATEST)"

ASSETS=("$SETUP" "$LATEST")
[ -f "$PORTABLE" ] && ASSETS+=("$PORTABLE") || echo "(портативный zip не найден — будет без него; собери pack-portable.sh)"

echo "=== создаю релиз $TAG в $REPO ==="
gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1 \
  && gh release upload "$TAG" "${ASSETS[@]}" --repo "$REPO" --clobber \
  || gh release create "$TAG" "${ASSETS[@]}" --repo "$REPO" \
       --title "Bulka Desktop $VER" \
       --notes "Портативное Windows-приложение Bulka. Установщик (.exe) с авто-обновлением или портативный zip. Свои ключи — в настройках, бесплатный режим (OVHcloud) — без ключа."
echo "Готово: https://github.com/$REPO/releases/tag/$TAG"
