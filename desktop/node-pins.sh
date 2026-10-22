# Node the desktop app bundles and the Linux build runs: one version, the sha256 of each nodejs.org archive
# (https://nodejs.org/dist/<version>/SHASUMS256.txt). Sourced by build.sh and build-linux-docker.sh.
NODE_VER=v24.21.0

# node_archive_sha256 <os>-<arch>
node_archive_sha256() {
  case "$NODE_VER-$1" in
    v24.21.0-win-x64) echo 158f7685b44de51f6c0df1d153526cbcd3e1bc739a8dfc607721cef75de9e541 ;;
    v24.21.0-linux-x64) echo fd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6 ;;
    v24.21.0-darwin-arm64) echo bed7eea5325e1108f32ce5228ddd6a5f0f08a499ee42aa7442aea583702f6057 ;;
    *) echo "[ERROR] нет пина sha256 для node $NODE_VER $1 в desktop/node-pins.sh" >&2; return 1 ;;
  esac
}

node_archive_name() {
  case "$1" in
    win-*) echo "node-$NODE_VER-$1.zip" ;;
    linux-*) echo "node-$NODE_VER-$1.tar.xz" ;;
    *) echo "node-$NODE_VER-$1.tar.gz" ;;
  esac
}

sha256_of() {
  if command -v sha256sum >/dev/null; then sha256sum "$1"; else shasum -a 256 "$1"; fi | cut -d' ' -f1
}

# fetch_node_archive <os>-<arch> <cache dir>: the archive in the cache, downloaded again unless its sha256 is the pin.
# Prints its path.
fetch_node_archive() {
  local want pkg archive got
  want="$(node_archive_sha256 "$1")" || return 1
  pkg="$(node_archive_name "$1")"
  archive="$2/$pkg"
  if [ -f "$archive" ] && [ "$(sha256_of "$archive")" = "$want" ]; then
    echo "$archive"
    return 0
  fi
  mkdir -p "$2"
  echo "  качаю $pkg с nodejs.org" >&2
  curl -fsSL "https://nodejs.org/dist/$NODE_VER/$pkg" -o "$archive.part" || { echo "[ERROR] $pkg не скачался" >&2; return 1; }
  got="$(sha256_of "$archive.part")"
  if [ "$got" != "$want" ]; then
    rm -f "$archive.part"
    echo "[ERROR] $pkg: sha256 $got, а пин $want" >&2
    return 1
  fi
  mv -f "$archive.part" "$archive"
  echo "$archive"
}
