// Copyright 2026 tauri-plugin-ad2mob contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

/// Event names triggered native → JS through the Tauri plugin event channel
/// (`Plugin.trigger` + `addPluginListener("admob", event, handler)`).
///
/// These strings are stable public API and MUST match `docs/native-contract.md`
/// and the Rust `models::events` constants exactly. Triggering is always safe:
/// the base class delivers only to registered JS listeners and is a no-op
/// otherwise, so managers trigger unconditionally.
public enum AdmobEvents {
  /// `admob://initialized` — `{ platform: String, testing: Bool }`
  public static let INITIALIZED = "admob://initialized"

  /// `admob://consent-changed` — `{ status: String }` (normalized UMP status).
  public static let CONSENT_CHANGED = "admob://consent-changed"

  /// `admob://tracking-authorization-changed` — `{ status: String }`
  /// (normalized ATT status).
  public static let TRACKING_AUTHORIZATION_CHANGED = "admob://tracking-authorization-changed"

  /// `admob://banner-loaded` — `{ adUnitId: String }`
  public static let BANNER_LOADED = "admob://banner-loaded"

  /// `admob://banner-failed` — `{ adUnitId?, code?, message, domain? }`
  public static let BANNER_FAILED = "admob://banner-failed"

  /// `admob://banner-opened` — `{ adUnitId? }`
  public static let BANNER_OPENED = "admob://banner-opened"

  /// `admob://banner-clicked` — `{ adUnitId? }`
  public static let BANNER_CLICKED = "admob://banner-clicked"

  /// `admob://banner-impression` — `{ adUnitId? }`
  public static let BANNER_IMPRESSION = "admob://banner-impression"

  /// `admob://banner-closed` — `{ adUnitId? }`
  public static let BANNER_CLOSED = "admob://banner-closed"

  /// `admob://interstitial-loaded` — `{ adUnitId: String }`
  public static let INTERSTITIAL_LOADED = "admob://interstitial-loaded"

  /// `admob://interstitial-failed` — `{ adUnitId?, code?, message, domain?, stage: "load" | "show" }`
  public static let INTERSTITIAL_FAILED = "admob://interstitial-failed"

  /// `admob://interstitial-opened` — `{ adUnitId? }`
  public static let INTERSTITIAL_OPENED = "admob://interstitial-opened"

  /// `admob://interstitial-impression` — `{ adUnitId? }`
  public static let INTERSTITIAL_IMPRESSION = "admob://interstitial-impression"

  /// `admob://interstitial-clicked` — `{ adUnitId? }`
  public static let INTERSTITIAL_CLICKED = "admob://interstitial-clicked"

  /// `admob://interstitial-closed` — `{ adUnitId? }`
  public static let INTERSTITIAL_CLOSED = "admob://interstitial-closed"

  /// `admob://rewarded-loaded` — `{ adUnitId: String }`
  public static let REWARDED_LOADED = "admob://rewarded-loaded"

  /// `admob://rewarded-failed` — `{ adUnitId?, code?, message, domain?, stage: "load" | "show" }`
  public static let REWARDED_FAILED = "admob://rewarded-failed"

  /// `admob://rewarded-opened` — `{ adUnitId? }`
  public static let REWARDED_OPENED = "admob://rewarded-opened"

  /// `admob://rewarded-impression` — `{ adUnitId? }`
  public static let REWARDED_IMPRESSION = "admob://rewarded-impression"

  /// `admob://rewarded-clicked` — `{ adUnitId? }`
  public static let REWARDED_CLICKED = "admob://rewarded-clicked"

  /// `admob://rewarded-earned` — `{ adUnitId?, amount: Number, type: String }`
  /// Fired only from the real `GADRewardedAdDelegate` reward callback.
  public static let REWARDED_EARNED = "admob://rewarded-earned"

  /// `admob://rewarded-closed` — `{ adUnitId? }`
  public static let REWARDED_CLOSED = "admob://rewarded-closed"
}
