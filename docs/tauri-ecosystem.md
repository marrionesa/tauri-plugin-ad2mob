# Presenting tauri-plugin-ad2mob to the Tauri ecosystem

How to position the plugin as a serious, official-quality community plugin
and the exact submission paths for the Tauri ecosystem. Author and maintainer:
**marrionesa** · repo: <https://github.com/marrionesa/tauri-plugin-ad2mob>.

## 0. Readiness checklist (all required before submitting anywhere)

The Tauri team reviews community plugins against the same bar as the official
`plugins-workspace`. Everything below is already satisfied by this repository
— keep it satisfied on every release:

| Requirement | Status |
| --- | --- |
| Tauri v2 mobile plugin structure (`build.rs` + `android/` + `ios/` + `guest-js/`) | ✅ |
| Dual license **MIT OR Apache-2.0** (Tauri's licensing policy) | ✅ `LICENSE`, `LICENSE-MIT`, `LICENSE-APACHE` |
| `cargo fmt` / `clippy -D warnings` clean, Rust tests green | ✅ CI + `verify.sh` |
| Kotlin JVM tests + Swift sources compiling (CI: Android build, iOS simulator build) | ✅ CI prepares generated mobile projects before compiling |
| TypeScript bindings with types + vitest suite | ✅ |
| Complete README: install, setup (Android manifest, iOS Info.plist, capabilities), API reference, events, error codes, troubleshooting | ✅ |
| Working example app (`examples/admob-demo`) | ✅ |
| CHANGELOG (Keep a Changelog) + SemVer | ✅ |
| ACL permissions shipped and documented (`ad2mob:default`) | ✅ |
| CI badge + real CI pipeline (Rust/TS/Android/iOS) | ✅ `.github/workflows/ci.yml` |
| Security policy + contributing guide + issue templates | ✅ |

## 1. Publish first (hard requirement)

Nothing gets listed anywhere without the packages being live:

1. Follow `docs/publishing.md` → tag `v0.2.0` → CI publishes.
2. Confirm both registries render correctly:
   - crates.io page (README rendered, docs.rs link green)
   - npm page (README rendered, correct repo link)
3. Confirm docs.rs builds: <https://docs.rs/tauri-plugin-ad2mob>.

## 2. Official plugins workspace (`tauri-apps/plugins-workspace`)

The [plugins-workspace](https://github.com/tauri-apps/plugins-workspace) is
the home of plugins **maintained by the Tauri team itself**. Inclusion means
co-maintainership by the team and adherence to its release cadence — it is an
invitation-level process:

1. Open a **discussion or issue proposing the plugin**, linking the repo,
   crates.io/npm pages and the CI badge. State the maintenance commitment.
2. Show traction: downloads, users, issues handled. The team prioritizes
   plugins that fill real gaps (AdMob has no official equivalent).
3. If invited, the plugin is migrated into the workspace monorepo structure.
   This repository's layout already mirrors the workspace template, so the
   migration is mostly mechanical.

Realistic expectation: this is a slow, maintainer-driven process. Do **not**
block the plugin's success on it.

## 3. Community listings (do these immediately)

### awesome-tauri

PR to [tauri-apps/awesome-tauri](https://github.com/tauri-apps/awesome-tauri)
under **Plugins**:

```markdown
- [tauri-plugin-ad2mob](https://github.com/marrionesa/tauri-plugin-ad2mob) — Google
  AdMob for Android & iOS: native banners, interstitials, rewarded ads, UMP
  consent and iOS ATT behind a typed API.
```

Read their contribution rules first (alphabetical placement, single-line
descriptions, quality filters — repos need docs, license and recent activity).

### Tauri docs — community plugins

The official docs accept community-plugin PRs at
[tauri-apps/tauri-docs](https://github.com/tauri-apps/tauri-docs) →
`sidebar` / community plugins listing. Same one-liner, keep the
"community-maintained" framing (never claim official status).

### Tauri Discord `#showcase` & GitHub Discussions

Announce on the Tauri Discord server (`#showcase` / `#plugins` channels) and
cross-post to the Tauri GitHub Discussions under "Show and tell". Include a
30-second demo GIF of the example app — posts with visuals get kept.

## 4. Credibility boosters (recommended)

- [ ] Record a short GIF/video of `examples/admob-demo` running on Android.
- [ ] Keep the docs landing (the `/` documentation site) linked in the repo
      description and README.
- [ ] Add GitHub Topics to the repo: `tauri`, `tauri-plugin`, `admob`,
      `android`, `ios`, `mobile-ads`, `rust`, `typescript`.
- [ ] Enable Discussions with a Q&A category.
- [ ] Pin an issue with a roadmap (v1.0 criteria, planned sizes/features).
- [ ] Tag releases on GitHub (the publish workflow already requires `v*`
      tags) — the releases page becomes the changelog UI.

## 5. Naming & branding rules

- The plugin is a **community project** — always describe it as
  "community-maintained", never "official" (that's reserved for the
  plugins-workspace).
- The disclaimer in `README.md` (no affiliation with Google/Tauri) must stay.
- Google branding policy: `AdMob` may be used to state *compatibility*
  ("Google AdMob integration for Tauri") but the project must not use Google
  logos or imply endorsement.
