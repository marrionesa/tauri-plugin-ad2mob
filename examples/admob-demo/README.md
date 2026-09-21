# admob-demo — example app for `tauri-plugin-ad2mob`

A minimal Tauri v2 application that exercises the complete plugin surface:

```
Initialize · Request Consent · Request ATT
Load/Show/Hide/Destroy Banner · Position Top/Bottom
Load/Show Interstitial
Load/Show Rewarded
Event Log · Destroy
```

It runs against **Google's official test ads only** (`isTesting: true` in
`tauri.conf.json`).

## Layout

```
admob-demo/
├── package.json          # Tauri CLI scripts (tauri dev / android dev / ios dev)
├── src-tauri/            # Rust app registering the plugin with init()
│   ├── Cargo.toml        # path dependency on ../../ (the plugin crate)
│   ├── tauri.conf.json   # plugins > ad2mob configuration (isTesting, debug)
│   └── src/main.rs
└── www/                  # static frontend, no bundler required
    ├── index.html        # button grid + event log
    ├── main.js           # uses the real plugin API (AdMob.*)
    └── tauri-plugin-ad2mob.js  # bundled guest API (generated)
```

## Running

From the repository root:

```bash
# desktop (ad commands return the typed UNSUPPORTED_PLATFORM error)
cd examples/admob-demo && bun install && bun run dev

# android (real ads flow, test units)
cd src-tauri && cargo tauri android init && cd ../../..
node scripts/prepare-demo-android.mjs
cd examples/admob-demo
bun run android:dev

# ios (real ads flow, test units)
bun run ios:dev
```

The mobile targets require the usual Tauri prerequisites (Android SDK /
Xcode) and the consuming-app configuration documented in the plugin README:

- Android: `com.google.android.gms.ads.APPLICATION_ID` `<meta-data>` in
  `gen/android/app/src/main/AndroidManifest.xml` (use the Google test app ID
  `ca-app-pub-3940256099942544~3347511713` while developing).
- iOS: `GADApplicationIdentifier` and `NSUserTrackingUsageDescription` in the
  generated Info.plist (test app ID: `ca-app-pub-3940256099942544~1458002511`).

## Regenerating the bundled API

`www/tauri-plugin-ad2mob.js` is the compiled guest API bundled as a single ESM
file so the example needs no bundler. Regenerate it after changing `guest-js`:

```bash
bun build guest-js/index.ts --format esm \
  --outfile examples/admob-demo/www/tauri-plugin-ad2mob.js --target browser
```
