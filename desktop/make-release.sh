#!/usr/bin/env bash
# Публикация десктоп-релиза Bulka: собирает latest.json (манифест авто-апдейтера Windows, Linux, macOS) и создаёт
# GitHub-релиз со всеми файлами. Запускать на Windows, когда готовы все три сборки:
#   Windows — bash desktop/build.sh и bash desktop/pack-portable.sh;
#   Linux   — bash desktop/build-linux-docker.sh desktop/dist-linux (в WSL);
#   macOS   — GitHub workflow «macOS build» на этом же коммите (без тега); его артефакт скачивается здесь
#             и подписывается ключом апдейтера (ключ живёт только на этой машине).
#
# Требует: gh (авторизован в timoncool/Bulka), ключ ~/.tauri/bulka-updater.key, пароль (BULKA_UPDATER_PASSWORD
# или ~/.claude/secrets/bulka.env). Тег по умолчанию desktop-v<version>.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Git Bash: node for Windows reads D:/... paths, not /d/...
command -v cygpath >/dev/null && ROOT="$(cygpath -m "$ROOT")"
DESK="$ROOT/desktop"
NSIS_DIR="$DESK/src-tauri/target/release/bundle/nsis"
LINUX_DIR="${BULKA_LINUX_DIR:-$DESK/dist-linux}"
MAC_DIR="$DESK/dist-macos"
OUT="$DESK/dist-release"
REPO="timoncool/Bulka"

VER="$(node -pe "require('$DESK/src-tauri/tauri.conf.json').version")"
TAG="${BULKA_RELEASE_TAG:-desktop-v$VER}"
KEY="${BULKA_UPDATER_KEY:-$HOME/.tauri/bulka-updater.key}"

SETUP="$NSIS_DIR/Bulka_${VER}_x64-setup.exe"
PORTABLE="$DESK/dist-portable/Bulka-portable.zip"
APPIMAGE="$LINUX_DIR/Bulka_${VER}_amd64.AppImage"
DEB="$LINUX_DIR/Bulka_${VER}_amd64.deb"
MAC_TGZ="$MAC_DIR/Bulka_${VER}_aarch64.app.tar.gz"
DMG="$MAC_DIR/Bulka_${VER}_aarch64.dmg"

missing=()
for f in "$SETUP" "$SETUP.sig" "$PORTABLE" "$APPIMAGE" "$APPIMAGE.sig" "$DEB"; do
  [ -f "$f" ] || missing+=("$f")
done
if [ ${#missing[@]} -gt 0 ]; then
  echo "[ERROR] нет файлов сборки:"; printf '  %s\n' "${missing[@]}"; exit 1
fi
[ -f "$KEY" ] || { echo "[ERROR] нет ключа подписи апдейтера: $KEY"; exit 1; }
if [ -z "${BULKA_UPDATER_PASSWORD:-}" ]; then
  SECRETS="${BULKA_SECRETS:-$HOME/.claude/secrets/bulka.env}"
  [ -f "$SECRETS" ] || { echo "[ERROR] нет пароля ключа: задай BULKA_UPDATER_PASSWORD или положи его в $SECRETS"; exit 1; }
  BULKA_UPDATER_PASSWORD="$(sed -n 's/^BULKA_UPDATER_PASSWORD=//p' "$SECRETS" | tr -d '\r')"
  [ -n "$BULKA_UPDATER_PASSWORD" ] || { echo "[ERROR] в $SECRETS нет строки BULKA_UPDATER_PASSWORD="; exit 1; }
fi

echo "[..] macOS: артефакт «macOS build» коммита $(git -C "$ROOT" rev-parse --short HEAD)"
SHA="$(git -C "$ROOT" rev-parse HEAD)"
RUN="$(gh run list --repo "$REPO" --workflow release-macos.yml --status success --json databaseId,headSha \
  --jq "map(select(.headSha == \"$SHA\"))[0].databaseId // empty")"
[ -n "$RUN" ] || { echo "[ERROR] нет успешного «macOS build» на $SHA: gh workflow run release-macos.yml --repo $REPO --ref <ветка>"; exit 1; }
rm -rf "$MAC_DIR"
gh run download "$RUN" --repo "$REPO" --name bulka-macos-arm64 --dir "$MAC_DIR"
[ -f "$MAC_TGZ" ] && [ -f "$DMG" ] || { echo "[ERROR] в артефакте прогона $RUN нет $(basename "$MAC_TGZ") или $(basename "$DMG")"; exit 1; }
TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$BULKA_UPDATER_PASSWORD" \
  "$ROOT/node_modules/.bin/tauri" signer sign -f "$KEY" "$MAC_TGZ" >/dev/null
[ -f "$MAC_TGZ.sig" ] || { echo "[ERROR] подпись $(basename "$MAC_TGZ") не создалась"; exit 1; }

url() { echo "https://github.com/$REPO/releases/download/$TAG/$(basename "$1")"; }
rm -rf "$OUT" && mkdir -p "$OUT"
# Манифест апдейтера (Tauri v2). Эндпоинт в tauri.conf.json -> releases/latest/download/latest.json
node -e '
const fs = require("fs");
const [out, ver, ...rest] = process.argv.slice(1);
const platforms = {};
for (let i = 0; i < rest.length; i += 3) {
  platforms[rest[i]] = { signature: fs.readFileSync(rest[i + 1], "utf8").trim(), url: rest[i + 2] };
}
const manifest = { version: ver, notes: `Bulka Desktop ${ver}`, pub_date: new Date().toISOString().replace(/\.\d+Z$/, "Z"), platforms };
fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
' "$OUT/latest.json" "$VER" \
  windows-x86_64 "$SETUP.sig" "$(url "$SETUP")" \
  linux-x86_64 "$APPIMAGE.sig" "$(url "$APPIMAGE")" \
  darwin-aarch64 "$MAC_TGZ.sig" "$(url "$MAC_TGZ")"
echo "[OK] latest.json: $OUT/latest.json"

ASSETS=("$SETUP" "$PORTABLE" "$APPIMAGE" "$DEB" "$DMG" "$MAC_TGZ" "$OUT/latest.json")

echo "=== релиз $TAG в $REPO ==="
if gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  gh release upload "$TAG" "${ASSETS[@]}" --repo "$REPO" --clobber
else
  gh release create "$TAG" "${ASSETS[@]}" --repo "$REPO" \
    --title "Bulka Desktop $VER" \
    --notes "Bulka для Windows (установщик с авто-обновлением или портативный zip), Linux (AppImage с авто-обновлением или .deb) и macOS на Apple Silicon (.dmg). Свои ключи — в настройках, бесплатный режим (OVHcloud) — без ключа."
fi
echo "[OK] https://github.com/$REPO/releases/tag/$TAG"
