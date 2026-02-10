#!/usr/bin/env bash
set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────────
REPO="evgenyponomarev/openclam-cli"
INSTALL_DIR="${OPENCLAM_HOME:-$HOME/.openclam}"
BIN_NAME="openclam"

# ── Helpers ─────────────────────────────────────────────────────────────
info()  { printf '\033[1;34m→\033[0m %s\n' "$*"; }
error() { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

command -v curl  >/dev/null 2>&1 || error "curl is required"
command -v tar   >/dev/null 2>&1 || error "tar is required"
command -v node  >/dev/null 2>&1 || error "Node.js >= 18 is required (install: https://nodejs.org)"

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 18 ] 2>/dev/null || error "Node.js >= 18 required (found $(node -v))"

# ── Resolve latest release ──────────────────────────────────────────────
info "Fetching latest release from github.com/$REPO …"
LATEST_TAG=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" \
  | grep -o '"tag_name": *"[^"]*"' | head -1 | cut -d'"' -f4)

[ -n "$LATEST_TAG" ] || error "Could not determine latest release"
info "Latest version: $LATEST_TAG"

TARBALL_URL="https://github.com/$REPO/releases/download/$LATEST_TAG/openclam-cli-${LATEST_TAG}.tar.gz"

# ── Download & extract ──────────────────────────────────────────────────
info "Downloading $TARBALL_URL …"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

curl -fsSL "$TARBALL_URL" -o "$TMP/cli.tar.gz"
mkdir -p "$INSTALL_DIR"
tar -xzf "$TMP/cli.tar.gz" -C "$INSTALL_DIR"

# ── Create launcher script ──────────────────────────────────────────────
LAUNCHER="$INSTALL_DIR/bin/$BIN_NAME"
mkdir -p "$INSTALL_DIR/bin"
cat > "$LAUNCHER" <<SCRIPT
#!/usr/bin/env bash
exec node "$INSTALL_DIR/dist/index.js" "\$@"
SCRIPT
chmod +x "$LAUNCHER"

# ── Add to PATH ─────────────────────────────────────────────────────────
add_to_path() {
  local line="export PATH=\"$INSTALL_DIR/bin:\$PATH\""
  for rc in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
    if [ -f "$rc" ] && ! grep -qF "$INSTALL_DIR/bin" "$rc"; then
      printf '\n# OpenClam CLI\n%s\n' "$line" >> "$rc"
    fi
  done
}

if ! echo "$PATH" | tr ':' '\n' | grep -qF "$INSTALL_DIR/bin"; then
  add_to_path
  info "Added $INSTALL_DIR/bin to PATH in shell rc files"
  info "Run: source ~/.bashrc  (or restart your terminal)"
fi

# ── Done ────────────────────────────────────────────────────────────────
info "OpenClam CLI $LATEST_TAG installed to $INSTALL_DIR"
info "Run: $BIN_NAME --help"
