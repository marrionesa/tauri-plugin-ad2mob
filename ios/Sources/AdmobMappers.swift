// Copyright 2026 tauri-plugin-ad2mob contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

/// Pure mapping helpers shared by the managers and unit tested without the
/// Google frameworks (`GoogleMobileAds` / `GoogleUserMessagingPlatform` are
/// iOS-only binary packages, so the mappers consume SDK enum **raw values**
/// instead of the enum types).
///
/// Every function is pure: no UIKit, no SDK, no side effects.
public enum AdmobMappers {
  /// Raw values of `UMPConsentStatus` (Google UMP SDK), mirrored here so the
  /// mapping stays framework-free and testable on any host.
  public enum UmpConsentStatusRaw: Int {
    case unknown = 0
    case required = 1
    case notRequired = 2
    case obtained = 3
  }

  /// Raw values of `ATTrackingManager.AuthorizationStatus`, mirrored here so
  /// the mapping stays framework-free and testable on any host.
  public enum AttAuthorizationStatusRaw: Int {
    case notDetermined = 0
    case restricted = 1
    case denied = 2
    case authorized = 3
  }

  /// Maps a `UMPConsentStatus` raw value to the normalized contract string:
  /// `"unknown"`, `"required"`, `"notRequired"` or `"obtained"`.
  /// Unrecognized values fall back to `"unknown"`.
  public static func consentStatus(fromUmpRawValue rawValue: Int) -> String {
    switch rawValue {
    case UmpConsentStatusRaw.required.rawValue:
      return "required"
    case UmpConsentStatusRaw.notRequired.rawValue:
      return "notRequired"
    case UmpConsentStatusRaw.obtained.rawValue:
      return "obtained"
    default:
      // `.unknown` and anything the SDK might add in the future.
      return "unknown"
    }
  }

  /// Maps an `ATTrackingManager.AuthorizationStatus` raw value to the
  /// normalized contract string: `"notDetermined"`, `"restricted"`,
  /// `"denied"` or `"authorized"`. `nil` (platforms without ATT, e.g. below
  /// iOS 14) and unrecognized values map to `"notAvailable"`.
  public static func trackingStatus(fromAttRawValue rawValue: Int?) -> String {
    guard let rawValue else {
      return "notAvailable"
    }
    switch rawValue {
    case AttAuthorizationStatusRaw.notDetermined.rawValue:
      return "notDetermined"
    case AttAuthorizationStatusRaw.restricted.rawValue:
      return "restricted"
    case AttAuthorizationStatusRaw.denied.rawValue:
      return "denied"
    case AttAuthorizationStatusRaw.authorized.rawValue:
      return "authorized"
    default:
      return "notAvailable"
    }
  }

  /// Parsed `showBanner.size` wire format. `BannerManager` consumes this and
  /// resolves it to the concrete `GADAdSize` (adaptive needs the container
  /// width, which only exists at UI time).
  public enum BannerSizeDescriptor: Equatable {
    /// 320x50 (standard banner).
    case banner
    /// 320x100 (large banner).
    case largeBanner
    /// 300x250 (medium rectangle).
    case mediumRectangle
    /// 468x60 (full banner).
    case fullBanner
    /// 728x90 (leaderboard, tablets only).
    case leaderboard
    /// Anchored adaptive banner sized from the container width.
    case adaptive
  }

  /// Parsed `showBanner.position` / `setBannerPosition.position` wire format.
  public enum BannerPositionDescriptor: String, Equatable {
    case top
    case bottom
  }

  /// Parses the `showBanner.size` argument. Returns nil for invalid values so
  /// the caller can reject with `INVALID_ARGUMENT`.
  public static func parseBannerSize(_ raw: String) -> BannerSizeDescriptor? {
    switch raw {
    case "banner":
      return .banner
    case "largeBanner":
      return .largeBanner
    case "mediumRectangle":
      return .mediumRectangle
    case "fullBanner":
      return .fullBanner
    case "leaderboard":
      return .leaderboard
    case "adaptive":
      return .adaptive
    default:
      return nil
    }
  }

  /// Parses the banner position argument. Returns nil for invalid values so
  /// the caller can reject with `INVALID_ARGUMENT`.
  public static func parseBannerPosition(_ raw: String) -> BannerPositionDescriptor? {
    switch raw {
    case "top":
      return .top
    case "bottom":
      return .bottom
    default:
      return nil
    }
  }
}
