# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - Initial development release

### Added

- `AdMob.initialize()` — idempotent SDK initialization with per-platform app IDs,
  test-mode support (`isTesting`) and optional automatic consent / ATT handling.
- `AdMob.configure()` — application-level Ad Unit ID configuration.
- Privacy: `requestConsent()`, `getConsentStatus()` built on Google UMP with the
  normalized `ConsentStatus` model (`unknown`, `required`, `notRequired`, `obtained`).
- Privacy: `requestTrackingAuthorization()` and
  `getTrackingAuthorizationStatus()` built on iOS App Tracking Transparency with
  the normalized `TrackingAuthorizationStatus` model.
- Interstitial ads: `loadInterstitial()`, `showInterstitial()`,
  `isInterstitialReady()`, `destroyInterstitial()`.
- Rewarded ads: `loadRewarded()`, `showRewarded()`, `isRewardedReady()`,
  `destroyRewarded()` with the real SDK reward callback (`rewarded-earned`).
- Native banners (never rendered inside the WebView DOM): `showBanner()`,
  `hideBanner()`, `isBannerVisible()`, `setBannerPosition()`, `destroyBanner()`
  with `top`/`bottom` positions, safe-area aware placement and the sizes
  `banner`, `largeBanner`, `mediumRectangle`, `fullBanner`, `leaderboard`,
  `adaptive`.
- Typed event system (`AdMob.on()` / `admob://<event>` names) with structured
  payloads for banner, interstitial, rewarded, consent and tracking events.
- `isSupported()` feature detection and `getStatus()` introspection.
- `destroy()` global cleanup of every native ad resource.
- Strongly typed TypeScript API (`AdMobError`, error codes, event map) and typed
  Rust error model (`AdMobError`) shared across platforms.
- Desktop compatibility: the crate compiles for desktop targets and every mobile
  command returns a controlled `UNSUPPORTED_PLATFORM` error.
- Android implementation (Google Mobile Ads SDK 24.x + UMP 3.x, main-thread
  discipline, native `AdView` with navigation-bar inset handling, lifecycle
  hooks).
- iOS implementation (GoogleMobileAds 13.x via Swift Package Manager + UMP +
  ATT, UIKit banner insertion into the Tauri view hierarchy with safe-area
  constraints, main-thread discipline).
- Unit tests for the Rust state machine, validation, error serialization and
  test-ID resolution; TypeScript tests for the guest API; pure-logic unit tests
  for Kotlin and Swift mapping layers.
- Example application demonstrating initialize, consent, ATT, banner,
  interstitial, rewarded, events and cleanup.
