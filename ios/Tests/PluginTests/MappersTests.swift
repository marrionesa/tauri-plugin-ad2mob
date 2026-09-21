// Copyright 2026 tauri-plugin-ad2mob contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import XCTest
@testable import tauri_plugin_ad2mob

/// Unit tests for the pure mapping helpers in `AdmobMappers.swift` and for the
/// event constants against the contract literals in `docs/native-contract.md`.
final class MappersTests: XCTestCase {
  // MARK: - Consent status mapping (Google UMP)

  func testConsentStatusMapping() {
    // All four UMPConsentStatus raw values.
    XCTAssertEqual(AdmobMappers.consentStatus(fromUmpRawValue: 0), "unknown")
    XCTAssertEqual(AdmobMappers.consentStatus(fromUmpRawValue: 1), "required")
    XCTAssertEqual(AdmobMappers.consentStatus(fromUmpRawValue: 2), "notRequired")
    XCTAssertEqual(AdmobMappers.consentStatus(fromUmpRawValue: 3), "obtained")
    // Fallback for values the current SDK does not define.
    XCTAssertEqual(AdmobMappers.consentStatus(fromUmpRawValue: 4), "unknown")
    XCTAssertEqual(AdmobMappers.consentStatus(fromUmpRawValue: -1), "unknown")
    XCTAssertEqual(AdmobMappers.consentStatus(fromUmpRawValue: Int.max), "unknown")
  }

  // MARK: - Tracking status mapping (iOS ATT)

  func testTrackingStatusMapping() {
    // All four ATTrackingManager.AuthorizationStatus raw values.
    XCTAssertEqual(AdmobMappers.trackingStatus(fromAttRawValue: 0), "notDetermined")
    XCTAssertEqual(AdmobMappers.trackingStatus(fromAttRawValue: 1), "restricted")
    XCTAssertEqual(AdmobMappers.trackingStatus(fromAttRawValue: 2), "denied")
    XCTAssertEqual(AdmobMappers.trackingStatus(fromAttRawValue: 3), "authorized")
    // Platforms without ATT (nil) and unrecognized values report notAvailable.
    XCTAssertEqual(AdmobMappers.trackingStatus(fromAttRawValue: nil), "notAvailable")
    XCTAssertEqual(AdmobMappers.trackingStatus(fromAttRawValue: 4), "notAvailable")
    XCTAssertEqual(AdmobMappers.trackingStatus(fromAttRawValue: -1), "notAvailable")
  }

  // MARK: - Banner size parsing

  func testBannerSizeParsing() {
    XCTAssertEqual(AdmobMappers.parseBannerSize("banner"), .banner)
    XCTAssertEqual(AdmobMappers.parseBannerSize("largeBanner"), .largeBanner)
    XCTAssertEqual(AdmobMappers.parseBannerSize("mediumRectangle"), .mediumRectangle)
    XCTAssertEqual(AdmobMappers.parseBannerSize("fullBanner"), .fullBanner)
    XCTAssertEqual(AdmobMappers.parseBannerSize("leaderboard"), .leaderboard)
    XCTAssertEqual(AdmobMappers.parseBannerSize("adaptive"), .adaptive)
    // Invalid values parse to nil so callers can reject INVALID_ARGUMENT.
    XCTAssertNil(AdmobMappers.parseBannerSize("skyscraper"))
    XCTAssertNil(AdmobMappers.parseBannerSize("BANNER"))
    XCTAssertNil(AdmobMappers.parseBannerSize(""))
  }

  // MARK: - Banner position parsing

  func testBannerPositionParsing() {
    XCTAssertEqual(AdmobMappers.parseBannerPosition("top"), .top)
    XCTAssertEqual(AdmobMappers.parseBannerPosition("bottom"), .bottom)
    // Invalid values parse to nil so callers can reject INVALID_ARGUMENT.
    XCTAssertNil(AdmobMappers.parseBannerPosition("left"))
    XCTAssertNil(AdmobMappers.parseBannerPosition("Top"))
    XCTAssertNil(AdmobMappers.parseBannerPosition(""))
  }

  // MARK: - Event constants vs the contract

  func testEventConstantsMatchContract() {
    XCTAssertEqual(AdmobEvents.INITIALIZED, "admob://initialized")
    XCTAssertEqual(AdmobEvents.CONSENT_CHANGED, "admob://consent-changed")
    XCTAssertEqual(
      AdmobEvents.TRACKING_AUTHORIZATION_CHANGED, "admob://tracking-authorization-changed")

    XCTAssertEqual(AdmobEvents.BANNER_LOADED, "admob://banner-loaded")
    XCTAssertEqual(AdmobEvents.BANNER_FAILED, "admob://banner-failed")
    XCTAssertEqual(AdmobEvents.BANNER_OPENED, "admob://banner-opened")
    XCTAssertEqual(AdmobEvents.BANNER_CLICKED, "admob://banner-clicked")
    XCTAssertEqual(AdmobEvents.BANNER_IMPRESSION, "admob://banner-impression")
    XCTAssertEqual(AdmobEvents.BANNER_CLOSED, "admob://banner-closed")

    XCTAssertEqual(AdmobEvents.INTERSTITIAL_LOADED, "admob://interstitial-loaded")
    XCTAssertEqual(AdmobEvents.INTERSTITIAL_FAILED, "admob://interstitial-failed")
    XCTAssertEqual(AdmobEvents.INTERSTITIAL_OPENED, "admob://interstitial-opened")
    XCTAssertEqual(AdmobEvents.INTERSTITIAL_IMPRESSION, "admob://interstitial-impression")
    XCTAssertEqual(AdmobEvents.INTERSTITIAL_CLICKED, "admob://interstitial-clicked")
    XCTAssertEqual(AdmobEvents.INTERSTITIAL_CLOSED, "admob://interstitial-closed")

    XCTAssertEqual(AdmobEvents.REWARDED_LOADED, "admob://rewarded-loaded")
    XCTAssertEqual(AdmobEvents.REWARDED_FAILED, "admob://rewarded-failed")
    XCTAssertEqual(AdmobEvents.REWARDED_OPENED, "admob://rewarded-opened")
    XCTAssertEqual(AdmobEvents.REWARDED_IMPRESSION, "admob://rewarded-impression")
    XCTAssertEqual(AdmobEvents.REWARDED_CLICKED, "admob://rewarded-clicked")
    XCTAssertEqual(AdmobEvents.REWARDED_EARNED, "admob://rewarded-earned")
    XCTAssertEqual(AdmobEvents.REWARDED_CLOSED, "admob://rewarded-closed")
  }

  func testEventConstantsAreUnique() {
    let constants = [
      AdmobEvents.INITIALIZED,
      AdmobEvents.CONSENT_CHANGED,
      AdmobEvents.TRACKING_AUTHORIZATION_CHANGED,
      AdmobEvents.BANNER_LOADED,
      AdmobEvents.BANNER_FAILED,
      AdmobEvents.BANNER_OPENED,
      AdmobEvents.BANNER_CLICKED,
      AdmobEvents.BANNER_IMPRESSION,
      AdmobEvents.BANNER_CLOSED,
      AdmobEvents.INTERSTITIAL_LOADED,
      AdmobEvents.INTERSTITIAL_FAILED,
      AdmobEvents.INTERSTITIAL_OPENED,
      AdmobEvents.INTERSTITIAL_IMPRESSION,
      AdmobEvents.INTERSTITIAL_CLICKED,
      AdmobEvents.INTERSTITIAL_CLOSED,
      AdmobEvents.REWARDED_LOADED,
      AdmobEvents.REWARDED_FAILED,
      AdmobEvents.REWARDED_OPENED,
      AdmobEvents.REWARDED_IMPRESSION,
      AdmobEvents.REWARDED_CLICKED,
      AdmobEvents.REWARDED_EARNED,
      AdmobEvents.REWARDED_CLOSED,
    ]
    XCTAssertEqual(constants.count, 22)
    XCTAssertEqual(Set(constants).count, constants.count, "event names must be unique")
  }
}
