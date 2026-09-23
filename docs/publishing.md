# Publishing runbook — crates.io & npm

Step-by-step guide to release `tauri-plugin-ad2mob`. Both packages always ship
the **same version** and the release is fully automated by GitHub Actions
(`.github/workflows/publish.yml`); this document covers the manual details,
the first-release setup and the recovery paths.

## Prerequisites (first release only)

1. **crates.io**: create an account, generate an API token with
   `publish-update` scope at <https://crates.io/settings/tokens>, add it as
   the repository secret `CARGO_REGISTRY_TOKEN`.
2. **npm**: create an *automation* access token at
   <https://www.npmjs.com/settings/marrionesa/tokens>, add it as the
   repository secret `NPM_TOKEN`. The package name `tauri-plugin-ad2mob` must
   not be taken (verify: <https://www.npmjs.com/package/tauri-plugin-ad2mob>).
3. **Verify ownership of the crate name** on crates.io:
   <https://crates.io/crates/tauri-plugin-ad2mob> must not exist yet (first
   publish claims it; afterwards only owners listed on the crate page may
   publish).
4. Optionally claim `npm` provenance by publishing from GitHub Actions (this
   workflow already runs there; add `id-token: write` if you enable
   provenance later).

## Versioning rules

- **SemVer** for both packages; Rust pre-1.0 conventions apply (breaking =
  minor bump).
- `Cargo.toml` version, `package.json` version and the CHANGELOG release
  heading **must agree** — `scripts/check-contract.mjs` enforces it.
- Bump `@tauri-apps/api` compatibility ranges (`^2.x`) intentionally only.

## Release procedure

### 1. Prepare the release

```bash
# 1. Bump both versions (keep them identical)
#    Cargo.toml [package] version, package.json "version"
# 2. Move CHANGELOG.md "Unreleased" notes under a new "## [X.Y.Z]" heading
# 3. Run the full pipeline locally:
bash scripts/verify.sh
```

`verify.sh` runs: fmt → check → clippy → tests (Rust), build → typecheck →
vitest (TS), cross-language contract parity, publish metadata + tarball
listings, and the real `cargo publish --dry-run` (which packages and builds
the crate exactly as crates.io will).

### 2. Commit, tag, push

```bash
git add -A
git commit -m "release: v0.2.0"
git tag v0.2.0
git push origin main --follow-tags
```

### 3. CI publishes both registries

On the `v*` tag push, GitHub Actions:

1. Checks the tag equals both package versions (fails otherwise).
2. Runs `scripts/verify.sh` (crates job) or build + checks (npm job).
3. `cargo publish --locked` → crates.io.
4. `npm publish` → npm.

Watch the *Publish* workflow run on the Actions tab. When green:

- <https://crates.io/crates/tauri-plugin-ad2mob>
- <https://www.npmjs.com/package/tauri-plugin-ad2mob>
- docs.rs builds automatically minutes later:
  <https://docs.rs/tauri-plugin-ad2mob>

## What the publish gates verify

| Gate                            | Check                                                                 |
| ------------------------------- | --------------------------------------------------------------------- |
| `scripts/check-contract.mjs`    | 24-command surface, 22 events, 9 error codes identical in Rust/Kotlin/Swift/TS; ACL files complete; versions agree |
| `scripts/check-publish.mjs`     | crates.io/npm metadata fields, crate tarball ships `build.rs`, native dirs, permissions; npm tarball ships dist + licenses; no dev artifacts leak |
| `cargo publish --dry-run`       | The crate **builds from the packaged tarball** — catches files that compile in the repo but are missing from the package |
| Tag/version match in CI         | A mistyped tag can never publish the wrong version                     |

## Troubleshooting releases

- **"crate version already exists"**: the tag was re-pushed or a publish was
  retried. Versions are immutable on both registries — bump and tag again.
- **docs.rs build fails**: docs.rs builds for the Android target configured in
  `[package.metadata.docs.rs]`. Test locally with
  `RUSTDOCFLAGS="--cfg docsrs" cargo +nightly doc --target x86_64-linux-android`
  or adjust the target list.
- **npm 403**: `NPM_TOKEN` expired or lacks publish scope; regenerate.
- **A file is missing from the crate tarball**: add it to a whitelist —
  Cargo packages are *git-based*; ensure the file is committed and not in
  `.gitignore`, then extend `exclude`/`include` in `Cargo.toml` as needed and
  re-run `cargo publish --dry-run`.

## Manual fallback (CI unavailable)

```bash
bash scripts/verify.sh
cargo publish --locked
bun run build && npm publish
```

crates.io first, npm second — the npm package is useless without the crate.
