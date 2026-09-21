#!/usr/bin/env bash
#
# Master verification pipeline for `tauri-plugin-ad2mob`.
#
# Runs EVERY real check end-to-end:
#   Rust      — fmt, check, clippy (-D warnings), unit + integration tests
#   TypeScript— build (CJS+ESM), typecheck, vitest suite
#   Contract  — cross-language parity (commands, permissions, events, errors)
#   Publish   — metadata + tarball listings + real `cargo publish --dry-run`
#
# Usage:
#   bash scripts/verify.sh              # full pipeline
#   bash scripts/verify.sh --quick      # skip the heavy cargo publish dry-run
#   bash scripts/verify.sh --with-example   # also cargo-check the demo app
#
# Exit code is 0 only when every step passed.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

QUICK=0
WITH_EXAMPLE=0
for arg in "$@"; do
  case "$arg" in
    --quick) QUICK=1 ;;
    --with-example) WITH_EXAMPLE=1 ;;
    *) echo "unknown flag: $arg"; exit 2 ;;
  esac
done

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------

# cargo/rustup may not be on PATH in minimal environments.
if ! command -v cargo >/dev/null 2>&1; then
  export PATH="$HOME/.cargo/bin:$PATH"
fi

# The dev sandbox compiles the crate without the desktop WebView runtime;
# when a stub pkg-config tree is available, expose it so `pkg-config` probes
# succeed. CI installs the real system libraries instead.
if [ -n "${ADMOB_STUB_DIR:-}" ] && [ -d "$ADMOB_STUB_DIR/pkgconfig" ]; then
  export PKG_CONFIG_PATH="$ADMOB_STUB_DIR/pkgconfig${PKG_CONFIG_PATH:+:$PKG_CONFIG_PATH}"
elif [ -d "$HOME/stub-gtk3/pkgconfig" ]; then
  export PKG_CONFIG_PATH="$HOME/stub-gtk3/pkgconfig${PKG_CONFIG_PATH:+:$PKG_CONFIG_PATH}"
fi

PASS=()
FAIL=()
SKIP=()
T0=$(date +%s)

step() { # step <title> <command...>
  local title="$1"; shift
  printf '\n\033[1m▸ %s\033[0m\n' "$title"
  if "$@"; then
    PASS+=("$title")
    printf '  \033[32m✔ PASS\033[0m\n'
  else
    local exit_code=$?
    FAIL+=("$title")
    printf '  \033[31m✘ FAIL (exit %s)\033[0m\n' "$exit_code"
  fi
}

skip() {
  SKIP+=("$1")
  printf '\n\033[1m▸ %s\033[0m\n  \033[33m↷ skipped\033[0m\n' "$1"
}

# ---------------------------------------------------------------------------
# Rust
# ---------------------------------------------------------------------------

step "Rust · formatting (cargo fmt --check)"        cargo fmt --check
step "Rust · type/borrow check (cargo check --all-targets)" cargo check --all-targets
step "Rust · lints (cargo clippy --all-targets -- -D warnings)" cargo clippy --all-targets -- -D warnings
step "Rust · tests (cargo test)"                    cargo test

# ---------------------------------------------------------------------------
# TypeScript
# ---------------------------------------------------------------------------

TS_BUILT=1
if command -v bun >/dev/null 2>&1; then
  step "TypeScript · build (CJS + ESM)"              bun run build
  TS_BUILT=$?
  step "TypeScript · typecheck"                      bun run typecheck
  step "TypeScript · tests (vitest)"                 bun run test
elif command -v npm >/dev/null 2>&1; then
  step "TypeScript · build (CJS + ESM)"              npm run build
  TS_BUILT=$?
  step "TypeScript · typecheck"                      npm run typecheck
  step "TypeScript · tests (vitest)"                 npm test
else
  skip "TypeScript · build/typecheck/tests (no bun/npm found)"
  TS_BUILT=1
fi

# ---------------------------------------------------------------------------
# Contract & publish metadata
# ---------------------------------------------------------------------------

step "Contract · cross-language parity"             node scripts/check-contract.mjs
step "Publish · metadata + tarball listings"        node scripts/check-publish.mjs

# ---------------------------------------------------------------------------
# Real publish gates
# ---------------------------------------------------------------------------

if [ "$QUICK" -eq 1 ]; then
  skip "Publish · cargo publish --dry-run (--quick)"
else
  step "Publish · cargo publish --dry-run (packages + builds the crate exactly as crates.io will)" \
    cargo publish --dry-run --allow-dirty
fi

if [ "$WITH_EXAMPLE" -eq 1 ]; then
  step "Example · cargo check (examples/admob-demo)" \
    cargo check --manifest-path examples/admob-demo/src-tauri/Cargo.toml
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

T1=$(date +%s)
DUR=$((T1 - T0))
printf '\n\033[1m════════════════════════════════════════════════════\033[0m\n'
printf '\033[1m  verify.sh · %ds\033[0m — \033[32m%d passed\033[0m' "$DUR" "${#PASS[@]}"
if [ "${#FAIL[@]}" -gt 0 ]; then printf ', \033[31m%d failed\033[0m' "${#FAIL[@]}"; fi
if [ "${#SKIP[@]}" -gt 0 ]; then printf ', \033[33m%d skipped\033[0m' "${#SKIP[@]}"; fi
printf '\n'
if [ "${#FAIL[@]}" -gt 0 ]; then
  for f in "${FAIL[@]}"; do printf '  \033[31m✘ %s\033[0m\n' "$f"; done
fi
printf '\033[1m════════════════════════════════════════════════════\033[0m\n\n'
[ "${#FAIL[@]}" -eq 0 ]
